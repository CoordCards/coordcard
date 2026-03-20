import argparse
import json
from pathlib import Path
import sys

from .validate import validate_card
from .state import init_state
from .next_step import next_step
from .run_vector import run_vector


def _clamp_score(n: int) -> int:
    return 0 if n < 0 else 3 if n > 3 else n


def main(argv=None):
    p = argparse.ArgumentParser(prog="coordcard")
    sub = p.add_subparsers(dest="cmd", required=True)

    pv = sub.add_parser("validate", help="Validate a CoordCard JSON file")
    pv.add_argument("card_json")

    ps = sub.add_parser("init-state", help="Print initial state JSON")

    pn = sub.add_parser("next", help="Compute next step deterministically")
    pn.add_argument("--card", required=True)
    pn.add_argument("--state", required=True)
    pn.add_argument("--R", required=True, type=int)
    pn.add_argument("--H", required=True, type=int)
    pn.add_argument("--O", required=True, type=int)

    pr = sub.add_parser("run-vector", help="Run a vector fixture JSON")
    pr.add_argument("vector_json")

    pd = sub.add_parser("demo", help="Run a compact demo (fixtures + summary)")

    args = p.parse_args(argv)

    if args.cmd == "validate":
        card = json.loads(Path(args.card_json).read_text(encoding="utf-8"))
        res = validate_card(card, repo_root=str(Path(__file__).resolve().parents[2]))
        if res.ok:
            print("OK")
            return 0
        print("FAIL")
        for e in res.errors or []:
            print(f"{e.path}: {e.message}")
        return 1

    if args.cmd == "init-state":
        print(json.dumps(init_state(), indent=2))
        return 0

    if args.cmd == "next":
        card = json.loads(Path(args.card).read_text(encoding="utf-8"))
        state = json.loads(Path(args.state).read_text(encoding="utf-8"))
        val = validate_card(card, repo_root=str(Path(__file__).resolve().parents[2]))
        if not val.ok:
            print("Card failed validation.", file=sys.stderr)
            return 1
        score = {
            "R": _clamp_score(args.R),
            "H": _clamp_score(args.H),
            "O": _clamp_score(args.O),
            "rationale": ["manual"],
            "confidence": 1,
        }
        out = next_step(card, state, score)
        print(json.dumps(out, indent=2))
        return 0

    if args.cmd == "run-vector":
        out = run_vector(args.vector_json)
        print(json.dumps(out, indent=2))
        return 0

    if args.cmd == "demo":
        card_path = "../examples/coordcard-v0.2-example.json"
        fixtures = [
            "../examples/test-vector-v0.2-normal-drift-recovery.json",
            "../examples/test-vector-v0.2-late-onset-O3.json",
            "../examples/test-vector-v0.2-oscillation-threshold-hopping.json",
        ]
        print("CoordCard demo (python)")
        print(f"- card: {card_path}")
        print("- repo: https://github.com/CoordCards/coordcard")
        print("- field reports: https://github.com/CoordCards/coordcard/issues/3")
        print("")

        # Validate card
        card = json.loads(Path(card_path).read_text(encoding="utf-8"))
        val = validate_card(card, repo_root=str(Path(__file__).resolve().parents[2]))
        if not val.ok:
            print(f"Demo card failed validation: {card_path}", file=sys.stderr)
            return 1

        for f in fixtures:
            out = run_vector(f)
            max_esc = max((x.get("escalationLevel") or 0) for x in out.get("out", []))
            entered_repair = any((x.get("action") != "continue") for x in out.get("out", []))
            last = out.get("out", [])[-1] if out.get("out") else {}
            first_trigger = None
            for x in out.get("out", []):
                tf = ((x.get("why") or {}).get("triggerFired") or "none")
                if tf != "none" and ("decay" not in str(tf)):
                    first_trigger = x
                    break
            timeout = next((x for x in out.get("out", []) if x.get("action") == "vent.tighten_scope"), None)

            print(f"[fixture] {f}")
            print(f"  cycles={len(out.get('out', []))} enteredRepair={entered_repair} maxEsc={max_esc}")
            if first_trigger:
                print(f"  firstTrigger: {first_trigger['why']['triggerFired']} @ i={first_trigger['i']}")
            if timeout:
                print(f"  timeout: vent.tighten_scope @ i={timeout['i']}")
            print(f"  last: {last.get('action')} (esc={last.get('escalationLevel')})")

        return 0

    return 2


if __name__ == "__main__":
    raise SystemExit(main())

import json
from pathlib import Path
from typing import Any, Dict

from .state import init_state
from .next_step import next_step


def run_vector(vector_path: str) -> Dict[str, Any]:
    v = json.loads(Path(vector_path).read_text(encoding="utf-8"))
    card_path = v["cardPath"]
    card = json.loads(Path(card_path).read_text(encoding="utf-8"))

    state = v.get("initialState") or init_state()

    out = []
    for i, cyc in enumerate(v.get("cycles", [])):
        res = next_step(card, state, cyc)
        why = res.get("why", {}) or {}
        out.append(
            {
                "i": i + 1,
                "score": cyc,
                "action": res.get("action"),
                "templateText": res.get("templateText"),
                "why": {
                    "triggerFired": why.get("triggerFired"),
                    "ruleSource": why.get("ruleSource"),
                    "ruleText": why.get("ruleText"),
                    "summary": why.get("summary"),
                    "rhoSum": why.get("rhoSum"),
                    "escalationLevel": why.get("escalationLevel"),
                },
                "escalationLevel": why.get("escalationLevel"),
                "rhoSum": why.get("rhoSum"),
                "choreography": res.get("state", {}).get("choreography"),
            }
        )
        state = res.get("state")

    return {
        "name": v.get("name"),
        "description": v.get("description"),
        "vectorPath": vector_path,
        "cardPath": card_path,
        "out": out,
    }

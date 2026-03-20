# CoordCard (Python reference port)

This is an **optional** Python port of the CoordCard reference implementation.

Goal: functional parity with the TypeScript reference for:
- schema validation (v0.1 + v0.2)
- `init_state`
- deterministic `next_step` (with traceable `why`)
- `run-vector` to replay JSON fixtures

## Install (editable)

From repo root:

```bash
cd python
python -m pip install -e .
```

## Quick try

```bash
# validate a v0.2 card
coordcard validate ../examples/coordcard-v0.2-example.json

# init state
coordcard init-state > /tmp/coordstate.json

# one step (manual score)
coordcard next --card ../examples/coordcard-v0.2-example.json --state /tmp/coordstate.json --R 0 --H 3 --O 0

# run a fixture
coordcard run-vector ../examples/test-vector-v0.2-late-onset-O3.json

# harder fixture (oscillation / threshold-hopping)
coordcard run-vector ../examples/test-vector-v0.2-oscillation-threshold-hopping.json

# demo (compact summaries)
coordcard demo
```

## Parity targets (TS vs Python)

For fixture replays, compare at minimum:
- `out[i].action`
- `out[i].escalationLevel`
- `out[i].choreography.stepIndex` / `cyclesInStep`

(`templateText` is also useful to compare where placeholder expansion is expected, e.g. `{{invariant_ids}}`.)

## Notes

- This port intentionally stays boring.
- No telemetry.
- No enforcement engine.

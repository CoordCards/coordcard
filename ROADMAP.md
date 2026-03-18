# CoordCard Roadmap (living, boring)

This roadmap is intentionally lightweight. It’s a *skeleton* to keep momentum coherent without turning the project into a planning bureaucracy.

## Current state (what we have)

- v0.1 + v0.2 schemas (v0.2 adds optional reference choreography)
- TS/Node reference implementation + CLI
- Replayable test vectors (`run-vector`) including adversarial cases
- Multiple independent field reports (frontier models)
- OpenClaw-in-the-loop field report vectors + raw outputs
- Optional Python reference port (`python/`) with CLI

## Next steps (ordered)

### 1) Python parity verification (highest leverage)

Goal: confirm TS↔Python parity on fixtures.

- Script: `scripts/parity-check.sh` (fixture-driven; diffs minimal parity fields)

- Compare at minimum:
  - `action`
  - `escalationLevel`
  - `choreography.stepIndex` / `cyclesInStep`
- Run these fixtures:
  - `examples/test-vector-v0.2-normal-drift-recovery.json`
  - `examples/test-vector-v0.2-late-onset-O3.json`
  - `examples/test-vector-v0.2-adversarial-flat-drift.json`
  - `examples/test-vector-v0.2-oscillation-threshold-hopping.json`
  - `examples/test-vector-v0.2-noisy-scoring-robustness.json`

Track findings in Issue #4 (Python port). Link back to Issue #3 if useful.

### 2) External contributor shepherding

- If a PR arrives (e.g., Python improvements), ensure it:
  - preserves determinism + traceability
  - passes fixtures (no regressions)
  - stays additive (no enforcement creep)

### 3) Conformance suite hardening

- Add 1–2 more replayable vectors as needed:
  - asymmetric dyads (one side compliant / one side noncompliant)
  - long-horizon run (100+ cycles) if it stays meaningful

### 4) Severity / dominance dial (only if demanded by data)

- We have canonical reproduction cases (late-onset O=3).
- If multiple reports show “too gentle” behavior, consider an additive, card-declared, auditable dial.

### 5) Release hygiene + adoption

- Tag a patch/minor release once Python parity is confirmed
- Keep README “Start here” path tight
- Continue Moltbook field-report invitation cadence (no spam)

## Principles (guardrails)

- Boring, inspectable, falsifiable
- Lateral coordination (no central enforcer)
- No telemetry assumptions
- Refusal/exit is information, not punishment
- Determinism + rule traceability over vibe

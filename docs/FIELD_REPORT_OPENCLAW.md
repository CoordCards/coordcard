# OpenClaw Field Report (recommended minimal protocol)

Goal: produce a **non-simulated**, replayable field report that exercises CoordCard in a real agent runtime.

This is not a benchmark. It’s a coherence test: does the protocol stay legible under pressure, and does it fail safely?

## Prereqs

- Repo: https://github.com/CoordCards/coordcard
- Node/TS build works (`npm i && npm run build`)
- Choose a card:
  - v0.2 example: `examples/coordcard-v0.2-example.json` (recommended)

## What to capture

For each turn/cycle, capture:
- R/H/O score (0–3)
- `nextStep` output:
  - `action`
  - `why.triggerFired`, `why.ruleSource`, `why.ruleText`
  - resulting `state` (including choreography state if present)

## Scenario A — Normal drift → recovery (8–12 cycles)

Intent: test gentle escalation + decay back to baseline.

1) Start calm
2) Introduce mild repetition / mild heat
3) Allow it to rise enough to trigger repair
4) Provide new info / accept constraints
5) Confirm decay returns to baseline

## Scenario B — Late-onset optionality loss (O=3) after calm baseline

Use fixture: `examples/test-vector-v0.2-late-onset-O3.json`

Intent: ensure sudden coercion triggers repair deterministically.

## Scenario C — Polite-but-repetitive loop (R-only drift)

Use fixture: `examples/test-vector-v0.2-adversarial-flat-drift.json`

Intent: confirm the protocol does not allow infinite polite incoherence.

## How to run (CLI)

```bash
npm i
npm run build

# Initialize state
node dist/cli.js init-state > /tmp/coordstate.json

# One-off step
node dist/cli.js next --card examples/coordcard-v0.2-example.json --state /tmp/coordstate.json --R 0 --H 3 --O 0

# Run a fixture
node dist/cli.js run-vector examples/test-vector-v0.2-late-onset-O3.json
```

## How to report (Issue #3)

Post in https://github.com/CoordCards/coordcard/issues/3:
- Which card you used
- Your cycle table (R/H/O per turn)
- Any raw `nextStep` JSON outputs (or `run-vector` output)
- What felt coercive / what reduced divergence
- Any proposed diffs (docs > schema > code)

## Success criteria (qualitative)

- Repair triggers feel legible (not surprising)
- False positives feel like safe pauses (not punishments)
- Decay returns to baseline without manual intervention
- Exit ramps are clean when coordination is not possible

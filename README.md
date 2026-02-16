# CoordCard v0.1

CoordCard provides a **deterministic repair and escalation protocol** for multi-agent and human–agent interactions.

It reduces coordination drift by making **invariants**, **repair triggers**, and **escalation/venting behavior** *machine-inspectable* and *portable*.

## What it is

A CoordCard is a machine-exchangeable declaration of:
- **Invariants** (globally hard constraints)
- **Adjustables** (phase-shift knobs)
- **Repair loop** (steps + canonical output templates)
- **Venting ladder** (flow redirection levels)
- **Re-entry conditions** (structured)
- **Metrics** (R/H/O: repetition / heat / optionality-loss; ordinal 0–3)
- **Escalation + decay** (prevents permanent repair lock)
- Optional: **telos** + **failure conditions** (audit aids; non-dogmatic)

## Files

- Schema v0.1: `schema/coordcard.v0.1.schema.json`
- Schema v0.2: `schema/coordcard.v0.2.schema.json`
- Minimal example (v0.1): `examples/coordcard-minimal.json`
- Strict example (v0.1): `examples/coordcard-strict.json`
- Multi-cycle demo (v0.1 escalation + decay): `examples/coordcard-multicycle-demo.json`
- v0.2 example (reference choreography): `examples/coordcard-v0.2-example.json`

## 3-minute try

```bash
cd coordcard-v0.1
npm i
npm run build

# 1) Validate a card
node dist/cli.js validate examples/coordcard-minimal.json

# 2) Initialize state
node dist/cli.js init-state > /tmp/coordstate.json

# 3) Run next-step with a manual score
node dist/cli.js next --card examples/coordcard-minimal.json --state /tmp/coordstate.json --R 0 --H 3 --O 0

# Inspect output: action, triggerFired, ruleSource/ruleText, and updated state
```

## API

The library exposes a minimal, inspectable interface:

- `validateCard(card): ValidationResult`
- `scoreObservation(text, opts?): ScoreResult`
  - assistive heuristics + manual override
  - returns `{ R, H, O, rationale[], confidence }`
- `initState(card?): State`
- `nextStep(card, state, score): NextStepResult`
  - deterministic; returns selected action + template + rule traceability + updated state

## Design non-goals (v0.1)

- Not an ethics engine
- Not sentiment analysis
- Not behavioral enforcement
- Not telemetry / data harvesting
- Not an orchestration layer

## Design principles

- **Open spec first** (intended to be permissively licensed)
- **Opt-in disclosure** (no telemetry assumed)
- **Portable & inspectable** (JSON + schema + templates)
- **Deterministic + auditable** (rule traceability in `why.ruleSource`/`why.ruleText`)

## R/H/O scoring

This spec intentionally uses **ordinal 0–3** scoring rather than false precision.

- `R` (repetition): 0 none → 3 stuck loop
- `H` (heat): 0 calm → 3 threats/coercion
- `O` (optionality loss): 0 open → 3 coercive lock-in / forced binary

Trigger + decay rules live in the card under `repair_loop.trigger`, `repair_loop.escalation.decay_rule`, and `metrics.rho.suggested_rules`.

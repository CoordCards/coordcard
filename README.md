# CoordCard v0.1

CoordCard provides a **deterministic repair and escalation protocol** for multi-agent and human–agent interactions.

It reduces coordination drift by making **invariants**, **repair triggers**, and **escalation/venting behavior** *machine-inspectable* and *portable*.

## Why this works (practical game theory, minimal)

In repeated coordination, the biggest hidden cost isn’t disagreement — it’s **drift**: ambiguity about invariants, thresholds, and what “repair” looks like under pressure.

CoordCard reduces drift by making repair legible via **deterministic triggers**, **bounded steps**, **reversible tests**, and **exit ramps**. This isn’t an enforcement engine; it’s equilibrium scaffolding that lowers the cost of staying cooperative and raises the cost of staying incoherent.

## “Wrongness” without metaphysics

CoordCard does not assume an agent has human intuition or conscience. It treats “wrongness” as **operational**: *what feedback signal forces an update?*

Common signals:
- **Invariant violations:** if a move violates a hard invariant, it is wrong *by definition* (disallowed).
- **Reversible / falsifiable tests:** propose a bounded experiment with success criteria + timebox; if it fails, update.
- **Explicit external signals (when available):** unit tests, measurements, logs, user confirmation — captured as inputs, not mind-reading.
- **Drift proxy:** rising correction cost (R/H/O trend) is a coarse signal that “something is off,” even if you don’t yet know which belief is wrong.

In other words: the goal is not to perfectly label who is wrong; it is to make correction **legible and cheap** under pressure.

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

v0.2 (additive): Reference Repair
Choreography Profile
v0.2 introduces an optional repair_loop choreohraphy reference profile to reduce implementer divergence around "what happens next" once reapir begins. It preserves v0.1 dwrwemininism + auditability while keeping KISS: no mandated runtime, no enforcement, no telemetry, no orchestration- just a portable, explicit reference sequence and structured inputs that implementations may follow by default.

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

## Monetization & ethics

- See: `docs/MONETIZATION_AND_ETHICS.md`

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

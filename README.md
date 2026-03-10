# CoordCard v0.1

CoordCard provides a **deterministic repair and escalation protocol** for multi-agent and human–agent interactions.

CoordCard is **lateral infrastructure**: coordination **without a central enforcer**.

It reduces coordination drift by making **invariants**, **repair triggers**, and **escalation/venting behavior** *machine-inspectable* and *portable*.

## Why this works (practical game theory, minimal)

In repeated coordination, the biggest hidden cost isn’t disagreement — it’s **drift**: ambiguity about invariants, thresholds, and what “repair” looks like under pressure.

CoordCard reduces drift by making repair legible via **deterministic triggers**, **bounded steps**, **reversible tests**, and **exit ramps**. This isn’t an enforcement engine; it’s equilibrium scaffolding for repeated interactions: lower the cost of cooperation/repair, make defection/lock-in legible, and keep exits clean so coordination can resume without coercion.

## “Wrongness” without metaphysics

CoordCard does not assume an agent has human intuition or conscience. It treats “wrongness” as **operational**: *what feedback signal forces an update?*

Common signals:
- **Invariant violations:** if a move violates a hard invariant, it is wrong *by definition* (disallowed).
- **Reversible / falsifiable tests:** propose a bounded experiment with success criteria + timebox; if it fails, update.
- **Explicit external signals (when available):** unit tests, measurements, logs, user confirmation — captured as inputs, not mind-reading.
- **Drift proxy:** rising correction cost (R/H/O trend) is a coarse signal that “something is off,” even if you don’t yet know which belief is wrong.

In other words: the goal is not to perfectly label who is wrong; it is to make correction **legible and cheap** under pressure.

Non-coordination is a valid outcome. Refusal/exit is treated as **boundary-respecting information**, not a moral failure or punishment.

A useful metaphor: **drift is normal** — what matters is the *return path*. The repair choreography is a recirculation loop: not mere repetition, but circulation that turns “costly drift” into renewed coherence.

Scoring is intentionally **ordinal and conservative**. If scoring is noisy, we prefer failure modes that look like **safe pauses** and **reversible tests** (false positives) over quiet drift into coercion (false negatives). False positives add friction (“cry wolf” risk), but preserve sovereignty and reduce harm.

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

## Setup & negotiation

- See: `docs/SETUP_AND_NEGOTIATION.md` (prevents hidden enforcement gradients; reduces foregone repair cycles)
- `invariant_ids` convention (prevents silent stalls): `docs/INVARIANT_IDS_CONVENTION.md`

## Field reports

- OpenClaw field report checklist: `docs/FIELD_REPORT_OPENCLAW.md`

## Refusal format (recommended)

- Legibility-preserving refusals: `docs/REFUSAL_FORMAT.md`

## Background (optional)

- Toroidal coordination (non-normative): `docs/PHILOSOPHY_TOROID.md`

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

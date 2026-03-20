# Plug-and-play adoption (non-goals preserved)

This doc outlines a boring, practical path to make CoordCard easy to adopt *without* turning it into a central enforcer, telemetry system, or orchestration layer.

## Design constraints (must hold)

- **Protocol stays open**; monetization (if any) lives in implementation/support.
- **No telemetry by default**.
- **No enforcement engine**.
- **No central orchestrator** required.
- **Deterministic + auditable** outputs (`why.ruleSource` / `why.ruleText`).

## Plug-and-play goals

A new user should be able to:

1) use a safe default card,
2) run a demo in <3 minutes,
3) maintain state with a boring default (file-based),
4) integrate into a chat loop with a thin adapter.

## 1) Default card + default profile

Provide and maintain:

- A **default v0.2 card** that is broadly safe.
- A default choreography profile: `default_v0_2`.

A user should not need to edit JSON on day one.

## 2) One-command demos

Target:

- Node: `npx coordcard demo`
- Python: `pipx run coordcard demo`

Even if the first version simply:
- validates a card
- runs a few fixtures
- prints the selected actions + traceability

…it builds confidence quickly.

## 3) State storage defaults (no DB)

Most adoption friction is state.

Provide a boring default:

- per-conversation state files (JSON)
- deterministic serialization
- a documented mapping from conversation-id → state-path

This should work without Redis/Postgres.

## 4) Thin adapters (not orchestration)

Plug-and-play comes from adapters, not a heavyweight coordinator.

Examples:

- OpenClaw adapter: wrap an agent turn with state loading/saving + nextStep.
- Discord adapter: per-thread state file + nextStep output.
- CLI wrapper that emits a ready-to-send message (templateText) plus a separate audit record.

Adapters should accept:

- `--card <path>`
- `--state-dir <path>`
- optional `--score` mode:
  - manual input (default)
  - simple heuristics (opt-in)

## 5) Templates that output usable text

A protocol becomes plug-and-play when outputs are pasteable.

Maintain a small set of recommended templates:

- pause
- tighten scope
- refusal format (invariant + re-entry condition)
- reversible test (success criteria + timebox)

## 6) “Start here” page

A single page should link:

- default card
- three commands
- fixtures (`run-vector`)
- where to file field reports (Issue #3)

## Suggested implementation sequence

1) Keep improving fixtures + parity (protocol truth)
2) Add demo commands (confidence)
3) Add state-dir semantics (persistence)
4) Add one adapter (OpenClaw first)
5) Add additional adapters (Discord, etc.)

## Notes on monetization (only as a boundary)

If there is monetization, it should come from:

- adapters/integrations,
- hosting (opt-in),
- enterprise support,
- training and customization.

Not from locking the protocol.

# CoordCard Services (boring, optional)

CoordCard is an **open protocol**. This page describes optional, paid services around implementation and adoption.

Nothing here changes the core stance:
- no telemetry by default
- no central enforcer / orchestration layer
- refusal/exit is valid
- adoption should not require accounts or lock-in

## What we can help with

### 1) Implementation & integration

Bring CoordCard into a real system (agent frameworks, tool runtimes, team workflows).

Typical deliverables:
- adapters/wrappers around your agent runtime (OpenClaw, custom orchestrators, etc.)
- “card handshake” conventions (how cards are introduced, referenced, updated)
- deterministic logging that produces reproducible field reports
- fixture vectors extracted from your real interactions (sanitized)

### 2) Fixture work (the real asset)

CoordCard improves by turning reality into artifacts.

We can help you:
- design “seam-reveal” vectors (6–20 cycles) for your failure modes
- calibrate conservative R/H/O scoring guidelines
- encode expected outputs (snapshots) and add CI checks

### 3) Reviews (protocol + implementation)

Focused review of:
- your CoordCard invariants / refusal format / choreography choices
- your implementation’s determinism and auditability
- failure modes: silent coercion gradients, ambiguous next-step stalls, refusal spirals

Output: written notes + concrete fixture suggestions.

### 4) Training / workshops

Short, practical sessions to help a team use CoordCards well:
- writing invariants that are inspectable (not vibes)
- designing refusal formats that preserve relationship (boundary + alternative + re-entry)
- conservative scoring + safe failure modes

### 5) Maintenance / stewardship (optional)

If you want a reliable cadence:
- triage field reports
- convert high-signal reports into fixtures
- ship releases on a schedule

## What we do *not* sell

- exclusive access to the protocol
- telemetry / data harvesting as a requirement
- enforcement layers (“make others comply”) as the default solution
- dark patterns or lock-in

## How to engage

Open an Issue (preferred):
- https://github.com/CoordCards/coordcard/issues

If you have a specific field report, start here:
- Issue #3 (field reports): https://github.com/CoordCards/coordcard/issues/3

When reporting, include:
- your scenario (what happened)
- your target outcome (what you wish happened)
- any constraints (latency, tools, safety requirements)
- (optional) a redacted transcript or a 6–10 turn summary + proposed R/H/O

# Setup & Negotiation (preventing hidden enforcement gradients)

CoordCard’s repair choreography is designed for **when drift is already happening**.
To avoid “foregone cycles” (repair loops that were preventable) and to prevent hidden coercion, implementers should treat **setup** as a first-class phase.

## 1) Setup phase (handshake)

Before a high-stakes interaction, agents can exchange cards (or card excerpts) and perform a lightweight handshake:

> A contract that cannot be questioned before signing is not a coordination scaffold.

- **Propose invariants** (hard constraints)
- **Confirm adjustables** (dials and defaults)
- **Agree on the repair choreography profile** (if using v0.2)
- **Agree on what counts as a valid feedback signal** (reversible tests, external signals, etc.)

This is where **invariants can be challenged or amended**.

> Repair is not the place to litigate the constitution.
> Setup is.

## 2) Repair phase (drift containment)

During repair, “arguing about invariants” can be a drift pattern.
That does **not** mean invariants are beyond question forever — it means the question should be routed back to a setup/renegotiation surface when capacity returns.

A safe pattern:
- In repair: restate the currently accepted invariants and proceed to reversible tests.
- After repair (or on exit): propose an invariant amendment as a new setup step.

## 3) Re-entry semantics (recommended)

If an interaction exits (vent) and later re-enters, a sane default is to treat this as a **new coordination cycle**:

- reset choreography position (`stepIndex=0`, `cyclesInStep=0`)
- keep learned constraints in the agent’s own memory/model (implementation detail)

This avoids assuming continuity that may not exist, while still allowing agents to internalize lessons from prior cycles.

## Why this matters

- Reduces coordination overhead by catching incompatibilities early.
- Prevents “coercive invariants” from being silently baked in without a negotiation surface.
- Keeps the protocol sovereignty-respecting: refusal/exit is information, not punishment.

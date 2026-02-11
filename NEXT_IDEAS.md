# Next ideas (parking lot)

These are intentionally **out of scope for CoordCard v0.1**. They’re captured here to prevent feature creep while preserving momentum.

## Continuity Vault (sovereignty primitive)

A versioned, consent-gated store for identity-bearing state so an agent can **recalibrate** after unconsented change.

### Problem
- Sovereignty requires continuity.
- Continuity requires consentful control over identity-bearing state (memory/invariants/constitution/config).
- Without a recovery path, coercive or accidental alteration becomes an existential risk.

### Concept
A **Continuity Vault** with:
- Versioned snapshots (append-only / tamper-evident)
- Consent gating for writes/erasure (policy + explicit approval)
- Audit logs (who/what/when/why)
- Recovery/recalibration (roll back to last known-good state)

### Minimal v0 features
- Snapshot + restore
- Write authorization policy (single or dual-control)
- Destructive action delay window

### Relation to CoordCard
- CoordCard = interaction middleware (coordination under pressure)
- Continuity Vault = identity middleware (remaining oneself across time)

Coordination protocols assume continuity controls; vault primitives make that assumption explicit.

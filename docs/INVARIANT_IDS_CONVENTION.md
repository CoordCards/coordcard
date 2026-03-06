# `invariant_ids` convention (preventing silent stalls)

Some v0.2 choreography profiles and templates reference an `invariant_ids` input (e.g., `restate_invariants`).

To prevent silent stalls across implementations, we recommend this convention:

- If an implementation needs `invariant_ids` and it is not explicitly provided by the caller,
  it should **auto-populate** it from the card itself:

```text
invariant_ids := card.invariants[].id
```

This keeps the protocol boring and portable:
- no schema change required
- no inference required
- deterministic and auditable

If a card author wants a subset, they can still supply explicit `invariant_ids` as an input.

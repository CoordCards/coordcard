#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

npm run build >/dev/null

FIXTURES=(
  examples/test-vector-v0.2-normal-drift-recovery.json
  examples/test-vector-v0.2-late-onset-O3.json
  examples/test-vector-v0.2-adversarial-flat-drift.json
  examples/test-vector-v0.2-oscillation-threshold-hopping.json
  examples/test-vector-v0.2-noisy-scoring-robustness.json
  examples/test-vector-v0.2-asymmetric-noncompliance.json
  examples/test-vector-v0.2-restate-invariants-autopop.json
  examples/test-vector-v0.1-level2-specificity.json
)

mkdir -p /tmp/coordcard-expected

for f in "${FIXTURES[@]}"; do
  base=$(basename "$f" .json)
  actual="/tmp/coordcard-expected/${base}.actual.json"
  expected="expected/${base}.expected.json"
  if [[ ! -f "$expected" ]]; then
    echo "Missing expected snapshot: $expected" >&2
    exit 1
  fi
  node dist/cli.js run-vector "$f" | node scripts/reduce-run-vector.mjs > "$actual"
  node scripts/compare-expected.mjs "$actual" "$expected"
done

echo "Expected snapshots: PASS"

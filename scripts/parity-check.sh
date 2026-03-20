#!/usr/bin/env bash
set -euo pipefail

# CoordCard TS↔Python parity check (fixture-driven)
#
# Compares minimal parity fields for each fixture:
# - out[i].action
# - out[i].escalationLevel
# - out[i].choreography.stepIndex
# - out[i].choreography.cyclesInStep
#
# Usage:
#   ./scripts/parity-check.sh
#
# Requirements:
#   - node + npm
#   - jq
#   - python3 (optional but recommended)
#   - Python deps installed for python port (jsonschema)
#     e.g. in a normal environment:
#       python -m pip install -e python

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

FIXTURES=(
  examples/test-vector-v0.2-normal-drift-recovery.json
  examples/test-vector-v0.2-late-onset-O3.json
  examples/test-vector-v0.2-adversarial-flat-drift.json
  examples/test-vector-v0.2-oscillation-threshold-hopping.json
  examples/test-vector-v0.2-noisy-scoring-robustness.json
  examples/test-vector-v0.2-restate-invariants-autopop.json
  examples/test-vector-v0.1-level2-specificity.json
)

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 2
  }
}

need_cmd node
need_cmd npm
# jq is preferred, but if it isn't installed we fall back to a tiny Node reducer.
HAS_JQ=1
if ! command -v jq >/dev/null 2>&1; then
  HAS_JQ=0
fi

# Build TS reference
npm run build >/dev/null

# TS runner
run_ts() {
  local fixture="$1"
  node dist/cli.js run-vector "$fixture"
}

# Python runner
PY_OK=1
if ! command -v python3 >/dev/null 2>&1; then
  PY_OK=0
fi

run_py() {
  local fixture="$1"
  # Prefer installed console script if present; fallback to python -m with PYTHONPATH.
  if command -v coordcard >/dev/null 2>&1; then
    coordcard run-vector "$fixture"
  else
    PYTHONPATH=python python3 -m coordcard.cli run-vector "$fixture"
  fi
}

# Reduce output to parity fields (stable for diff)
reduce() {
  if [[ "$HAS_JQ" -eq 1 ]]; then
    jq '{name, vectorPath, cardPath, out: [ .out[] | {i, action, escalationLevel, choreography: {stepIndex: (.choreography.stepIndex // 0), cyclesInStep: (.choreography.cyclesInStep // 0)} } ] }'
  else
    node scripts/reduce-run-vector.mjs
  fi
}

fail=0

echo "== CoordCard parity check =="
echo "Fixtures: ${#FIXTURES[@]}"

echo "-- TS build: OK"

if [[ "$PY_OK" -eq 0 ]]; then
  echo "-- Python: python3 not found; skipping Python parity." >&2
else
  echo "-- Python: detected"
fi

for f in "${FIXTURES[@]}"; do
  echo
  echo "[fixture] $f"

  ts_out="$(run_ts "$f" | reduce)"

  if [[ "$PY_OK" -eq 0 ]]; then
    echo "  TS: OK (Python skipped)"
    continue
  fi

  set +e
  py_raw="$(run_py "$f" 2>/dev/null)"
  py_status=$?
  set -e

  if [[ "$py_status" -ne 0 ]]; then
    echo "  Python: FAILED to run fixture (missing deps? install python port?)" >&2
    echo "  Hint: python -m pip install -e python" >&2
    fail=1
    continue
  fi

  py_out="$(echo "$py_raw" | reduce)"

  if diff -u <(echo "$ts_out") <(echo "$py_out") >/dev/null; then
    echo "  TS↔PY parity: OK"
  else
    echo "  TS↔PY parity: DIFF" >&2
    diff -u <(echo "$ts_out") <(echo "$py_out") || true
    fail=1
  fi

done

if [[ "$fail" -ne 0 ]]; then
  echo
  echo "Parity check: FAIL" >&2
  exit 1
fi

echo
echo "Parity check: PASS"

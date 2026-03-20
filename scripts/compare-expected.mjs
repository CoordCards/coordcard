import fs from 'node:fs';

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function diff(a, b) {
  const da = JSON.stringify(a);
  const db = JSON.stringify(b);
  return da === db;
}

const [,, actualPath, expectedPath] = process.argv;
if (!actualPath || !expectedPath) {
  console.error('Usage: node scripts/compare-expected.mjs <actual.json> <expected.json>');
  process.exit(2);
}

const a = readJson(actualPath);
const e = readJson(expectedPath);
if (!diff(a, e)) {
  console.error('DIFF:', actualPath, '!=', expectedPath);
  process.exit(1);
}
console.log('OK', expectedPath);

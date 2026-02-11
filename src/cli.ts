#!/usr/bin/env node

import fs from 'node:fs';
import { validateCard, initState, nextStep } from './index.js';

function usage() {
  console.log(`coordcard v0.1\n\nCommands:\n  validate <card.json>\n  next --card <card.json> --state <state.json> --R <0-3> --H <0-3> --O <0-3>\n  init-state\n`);
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  usage();
  process.exit(0);
}

const cmd = args[0];

if (cmd === 'validate') {
  const file = args[1];
  if (!file) {
    console.error('Missing card.json');
    process.exit(2);
  }
  const card = JSON.parse(fs.readFileSync(file, 'utf8'));
  const res = validateCard(card);
  if (res.ok) {
    console.log('OK');
    process.exit(0);
  }
  console.log('FAIL');
  for (const e of res.errors) console.log(`${e.path}: ${e.message}`);
  process.exit(1);
}

if (cmd === 'init-state') {
  console.log(JSON.stringify(initState(), null, 2));
  process.exit(0);
}

if (cmd === 'next') {
  const get = (k: string) => {
    const i = args.indexOf(k);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const cardPath = get('--card');
  const statePath = get('--state');
  const R = Number(get('--R'));
  const H = Number(get('--H'));
  const O = Number(get('--O'));
  if (!cardPath || !statePath || [R, H, O].some((x) => Number.isNaN(x))) {
    console.error('Missing required args.');
    usage();
    process.exit(2);
  }
  const card = JSON.parse(fs.readFileSync(cardPath, 'utf8'));
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const res = validateCard(card);
  if (!res.ok) {
    console.error('Card failed validation.');
    process.exit(1);
  }
  const clampScore = (n: number) => (n < 0 ? 0 : n > 3 ? 3 : n) as 0 | 1 | 2 | 3;
  const out = nextStep(card, state, { R: clampScore(R), H: clampScore(H), O: clampScore(O), rationale: ['manual'], confidence: 1 });
  console.log(JSON.stringify(out, null, 2));
  process.exit(0);
}

console.error(`Unknown command: ${cmd}`);
usage();
process.exit(2);

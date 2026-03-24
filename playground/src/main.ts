import cardV02 from '../../examples/coordcard-v0.2-example.json';
import { FIXTURES } from './fixtures.js';
import { runVector } from './runner.js';

function $(id: string) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el;
}

const fixtureSelect = $('fixture') as HTMLSelectElement;
const runBtn = $('run') as HTMLButtonElement;
const copyBtn = $('copy') as HTMLButtonElement;
const summary = $('summary') as HTMLDivElement;
const tbody = document.querySelector('#table tbody') as HTMLTableSectionElement;
const jsonPre = $('json') as HTMLPreElement;

for (const f of FIXTURES) {
  const opt = document.createElement('option');
  opt.value = f.id;
  opt.textContent = f.label;
  fixtureSelect.appendChild(opt);
}

let lastRun: any = null;

function render(run: any) {
  tbody.innerHTML = '';

  const enteredRepair = run.out.some((x: any) => x.action !== 'continue');
  const maxEsc = Math.max(...run.out.map((x: any) => x.escalationLevel));
  const timeout = run.out.find((x: any) => x.action === 'vent.tighten_scope');
  const firstTrigger = run.out.find((x: any) => x.triggerFired && x.triggerFired !== 'none' && !String(x.triggerFired).includes('decay'));

  summary.textContent = `cycles=${run.out.length} enteredRepair=${enteredRepair} maxEsc=${maxEsc}` +
    (firstTrigger ? ` | firstTrigger=${firstTrigger.triggerFired}@${firstTrigger.i}` : '') +
    (timeout ? ` | timeout@${timeout.i}` : '');

  for (const row of run.out) {
    const tr = document.createElement('tr');
    const cells = [
      String(row.i),
      `${row.score.R}/${row.score.H}/${row.score.O}`,
      String(row.rhoSum),
      String(row.triggerFired),
      String(row.action),
      String(row.escalationLevel),
      String(row.stepIndex),
      String(row.cyclesInStep)
    ];
    for (const c of cells) {
      const td = document.createElement('td');
      td.textContent = c;
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  jsonPre.textContent = JSON.stringify(run, null, 2);
}

async function run() {
  const f = FIXTURES.find((x) => x.id === fixtureSelect.value) ?? FIXTURES[0];
  const card = cardV02 as any;
  const out = await runVector(f.vector, card);
  lastRun = { fixture: f, card: 'examples/coordcard-v0.2-example.json', out: out.out };
  render(lastRun);
}

async function copyReport() {
  if (!lastRun) {
    await run();
  }
  const f = lastRun.fixture;
  const md = [
    `Field report (playground)`,
    ``,
    `- Card: examples/coordcard-v0.2-example.json`,
    `- Fixture: ${f.label}`,
    `- Vector name: ${f.vector.name ?? ''}`,
    ``,
    `Reduced output (paste into Issue #3):`,
    '```json',
    JSON.stringify(lastRun, null, 2),
    '```',
    ``,
    `Issue #3: https://github.com/CoordCards/coordcard/issues/3`
  ].join('\n');

  await navigator.clipboard.writeText(md);
  copyBtn.textContent = 'Copied!';
  setTimeout(() => (copyBtn.textContent = 'Copy Issue #3 report'), 1200);
}

runBtn.addEventListener('click', () => {
  run().catch((e) => {
    console.error(e);
    alert(String(e));
  });
});

copyBtn.addEventListener('click', () => {
  copyReport().catch((e) => {
    console.error(e);
    alert(String(e));
  });
});

// Auto-run initial fixture
run().catch(() => void 0);

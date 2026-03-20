import fs from 'node:fs';

let s = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => (s += d));
process.stdin.on('end', () => {
  const j = JSON.parse(s);
  const out = {
    name: j.name,
    vectorPath: j.vectorPath,
    cardPath: j.cardPath,
    out: (j.out || []).map((x) => ({
      i: x.i,
      action: x.action,
      escalationLevel: x.escalationLevel,
      choreography: {
        stepIndex: x.choreography?.stepIndex ?? 0,
        cyclesInStep: x.choreography?.cyclesInStep ?? 0
      }
    }))
  };
  process.stdout.write(JSON.stringify(out, null, 2));
});

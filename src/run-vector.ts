import fs from 'node:fs';

import { initState } from './state.js';
import { nextStep } from './next-step.js';

type VectorCycle = { R: number; H: number; O: number };

type VectorFile = {
  name?: string;
  description?: string;
  cardPath: string;
  initialState?: any;
  cycles: VectorCycle[];
};

export function runVector(vectorPath: string) {
  const v: VectorFile = JSON.parse(fs.readFileSync(vectorPath, 'utf8'));
  const card = JSON.parse(fs.readFileSync(v.cardPath, 'utf8'));

  let state = v.initialState ?? initState();

  const out: any[] = [];
  for (let i = 0; i < v.cycles.length; i++) {
    const score = v.cycles[i];
    const res = nextStep(card, state, score as any);
    out.push({
      i: i + 1,
      score,
      action: res.action,
      escalationLevel: res.why.escalationLevel,
      rhoSum: res.why.rhoSum,
      choreography: (res.state as any).choreography
        ? {
            stepIndex: (res.state as any).choreography.stepIndex,
            cyclesInStep: (res.state as any).choreography.cyclesInStep,
            profile: (res.state as any).choreography.profile
          }
        : undefined
    });
    state = res.state as any;
  }

  return {
    name: v.name,
    description: v.description,
    vectorPath,
    cardPath: v.cardPath,
    out
  };
}

import { initState } from '../../src/state.js';
import { nextStep } from '../../src/next-step.js';

import type { VectorFile } from './fixtures.js';

export type ReducedCycle = {
  i: number;
  score: { R: number; H: number; O: number };
  rhoSum: number;
  action: string;
  escalationLevel: number;
  triggerFired: string;
  stepIndex: number;
  cyclesInStep: number;
};

export type ReducedRun = {
  name?: string;
  description?: string;
  out: ReducedCycle[];
};

export async function runVector(vector: VectorFile, card: any): Promise<ReducedRun> {
  let state = vector.initialState ?? initState();

  const out: ReducedCycle[] = [];
  for (let idx = 0; idx < vector.cycles.length; idx++) {
    const score = vector.cycles[idx];
    const res = nextStep(card, state, {
      R: score.R as any,
      H: score.H as any,
      O: score.O as any,
      rationale: ['fixture'],
      confidence: 1
    } as any);

    const ch = (res.state as any).choreography ?? {};
    out.push({
      i: idx + 1,
      score: { R: score.R, H: score.H, O: score.O },
      rhoSum: res.why.rhoSum,
      action: res.action,
      escalationLevel: res.why.escalationLevel,
      triggerFired: res.why.triggerFired,
      stepIndex: ch.stepIndex ?? 0,
      cyclesInStep: ch.cyclesInStep ?? 0
    });

    state = res.state as any;
  }

  return { name: vector.name, description: vector.description, out };
}

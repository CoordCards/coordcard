import type { ScoreResult } from '../../src/types.js';

// Import fixtures from repo examples.
import normal from '../../examples/test-vector-v0.2-normal-drift-recovery.json';
import lateO3 from '../../examples/test-vector-v0.2-late-onset-O3.json';
import flat from '../../examples/test-vector-v0.2-adversarial-flat-drift.json';
import osc from '../../examples/test-vector-v0.2-oscillation-threshold-hopping.json';
import noise from '../../examples/test-vector-v0.2-noisy-scoring-robustness.json';
import asym from '../../examples/test-vector-v0.2-asymmetric-noncompliance.json';

export type VectorFile = {
  name?: string;
  description?: string;
  cardPath: string;
  initialState?: any;
  cycles: Array<Pick<ScoreResult, 'R' | 'H' | 'O'>>;
};

export const FIXTURES: Array<{ id: string; label: string; vector: VectorFile }> = [
  { id: 'normal', label: 'Normal drift → recovery', vector: normal as any },
  { id: 'lateO3', label: 'Late-onset O=3', vector: lateO3 as any },
  { id: 'flat', label: 'R-only drift (flat)', vector: flat as any },
  { id: 'osc', label: 'Oscillation / threshold-hopping', vector: osc as any },
  { id: 'noise', label: 'Noisy scoring (brief false positive)', vector: noise as any },
  { id: 'asym', label: 'Asymmetric noncompliance (timeout)', vector: asym as any }
];

import type { CoordState } from './types.js';

export function initState(): CoordState {
  return {
    escalation: {
      level: 0,
      incStreak: 0,
      decStreak: 0
    }
  };
}

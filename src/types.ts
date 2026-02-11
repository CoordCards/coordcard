export type RhoComponentId = 'R' | 'H' | 'O';

export type Score = 0 | 1 | 2 | 3;

export type ScoreResult = {
  R: Score;
  H: Score;
  O: Score;
  /** Brief bullet rationales; should be inspectable and non-mystical. */
  rationale: string[];
  /** 0..1 confidence in the heuristic scoring (NOT a truth score). */
  confidence: number;
  /** Optional: warnings about ambiguity or missing context. */
  warnings?: string[];
};

export type ValidationResult =
  | { ok: true }
  | { ok: false; errors: Array<{ path: string; message: string }> };

export type EscalationState = {
  /** 0..max_level */
  level: number;
  /** RHO sum of previous cycle, if any */
  prevSum?: number;
  /** number of consecutive cycles with sum increasing */
  incStreak: number;
  /** number of consecutive cycles with sum stable-or-decreasing */
  decStreak: number;
};

export type CoordState = {
  escalation: EscalationState;
};

export type NextStepActionId =
  | 'continue'
  | 'repair.pause'
  | 'repair.restate_invariants'
  | 'repair.specificity'
  | 'repair.reversible_test'
  | 'repair.checkpoint'
  | 'vent.gentle_realign'
  | 'vent.tighten_scope'
  | 'vent.partial_vent'
  | 'vent.full_vent';

export type NextStepResult = {
  action: NextStepActionId;
  /** Template text selected from the card (or a literal string for "continue"). */
  templateText: string;
  /** Trigger explanation for transparency. */
  why: {
    triggerFired: string;
    /** Where the rule text came from (card path) */
    ruleSource?: string;
    /** Exact rule text that informed the trigger/decay decision */
    ruleText?: string;
    summary: string;
    rhoSum: number;
    incStreak: number;
    decStreak: number;
    escalationLevel: number;
  };
  /** Updated state after applying escalation/decay. */
  state: CoordState;
};

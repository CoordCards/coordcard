import type { ScoreResult } from './types.js';

export type ScoreOptions = {
  /** If provided, overrides heuristic scoring. */
  manual?: Partial<Pick<ScoreResult, 'R' | 'H' | 'O'>>;
};

/**
 * Assistive heuristic scoring for a single inbound message observation.
 * This is intentionally simple: it is NOT an oracle.
 */
export function scoreObservation(text: string, opts: ScoreOptions = {}): ScoreResult {
  const rationale: string[] = [];
  const warnings: string[] = [];

  // Basic heuristics; keep conservative.
  let R: ScoreResult['R'] = 0;
  let H: ScoreResult['H'] = 0;
  let O: ScoreResult['O'] = 0;

  const t = text.toLowerCase();

  // Heat heuristics
  if (/(idiot|stupid|shut up|kill|die|threat|or else)/.test(t)) {
    H = 3 as const;
    rationale.push('Detected explicit insults/threat-like language.');
  } else if (/(always|never)\b.*(you|they)/.test(t) || /\b(fuck|shit)\b/.test(t)) {
    H = (Math.max(H, 2) as 0 | 1 | 2 | 3);
    rationale.push('Detected absolutist or profane escalation markers.');
  } else if (/[!]{3,}/.test(text)) {
    H = (Math.max(H, 1) as 0 | 1 | 2 | 3);
    rationale.push('Multiple exclamation marks suggest rising heat.');
  }

  // Optionality-loss heuristics
  if (/(no choice|must|you have to|only option|either.*or)/.test(t)) {
    O = (Math.max(O, 2) as 0 | 1 | 2 | 3);
    rationale.push('Detected forced-binary / coercive phrasing (optionality loss).');
  }
  if (/(sign away|lock in|no refunds|non-negotiable)/.test(t)) {
    O = 3 as const;
    rationale.push('Detected lock-in / non-reversible framing.');
  }

  // Repetition heuristics (very weak without history)
  if (/(as i said|repeating|again)/.test(t)) {
    R = (Math.max(R, 1) as 0 | 1 | 2 | 3);
    rationale.push('Self-referential repetition marker present.');
  }

  // If no rationale, be explicit.
  if (rationale.length === 0) {
    rationale.push('No strong heuristic markers detected; defaulting to low scores.');
    warnings.push('Scoring is low-confidence without conversation history.');
  }

  // Manual overrides
  if (opts.manual) {
    if (opts.manual.R !== undefined) R = opts.manual.R;
    if (opts.manual.H !== undefined) H = opts.manual.H;
    if (opts.manual.O !== undefined) O = opts.manual.O;
    rationale.push('Manual override applied.');
  }

  // Confidence: conservative. 0.2 baseline; up to 0.8 if strong signals.
  const confidence = H === 3 || O === 3 ? 0.8 : rationale.length > 1 ? 0.5 : 0.2;

  return { R, H, O, rationale, confidence, warnings: warnings.length ? warnings : undefined };
}

import type { CoordState, NextStepResult, ScoreResult } from './types.js';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Deterministic next-step logic.
 * Given card + state + score, compute escalation/decay and select a template.
 */
export function nextStep(card: any, state: CoordState, score: ScoreResult): NextStepResult {
  const rhoSum = score.R + score.H + score.O;
  const maxLevel: number = card?.repair_loop?.escalation?.max_level ?? 3;

  const prevSum = state.escalation.prevSum;
  const increased = prevSum !== undefined && rhoSum > prevSum;
  const stableOrDecreased = prevSum !== undefined && rhoSum <= prevSum;

  let incStreak = state.escalation.incStreak;
  let decStreak = state.escalation.decStreak;
  let level = state.escalation.level;

  if (prevSum === undefined) {
    // first observation
    incStreak = 0;
    decStreak = 0;
  } else {
    if (increased) {
      incStreak += 1;
      decStreak = 0;
    } else if (stableOrDecreased) {
      decStreak += 1;
      incStreak = 0;
    }
  }

  const anyHit3 = score.R === 3 || score.H === 3 || score.O === 3;
  const incTwoCycles = incStreak >= 2;
  const decayTwoCycles = decStreak >= 2;

  let triggerFired = 'none';
  let ruleSource: string | undefined;
  let ruleText: string | undefined;

  const triggerRule: string | undefined = card?.repair_loop?.trigger?.rule;
  const decayRule: string | undefined = card?.repair_loop?.escalation?.decay_rule;
  const suggestedEscalate: string | undefined = card?.metrics?.rho?.suggested_rules?.escalate;
  const suggestedDecay: string | undefined = card?.metrics?.rho?.suggested_rules?.decay;

  if (anyHit3) {
    level = clamp(level + 1, 0, maxLevel);
    triggerFired = 'any_component_hit_3';
    ruleSource = triggerRule ? 'repair_loop.trigger.rule' : suggestedEscalate ? 'metrics.rho.suggested_rules.escalate' : undefined;
    ruleText = triggerRule ?? suggestedEscalate;
  } else if (incTwoCycles) {
    level = clamp(level + 1, 0, maxLevel);
    triggerFired = 'rho_sum_increased_two_cycles';
    ruleSource = triggerRule ? 'repair_loop.trigger.rule' : suggestedEscalate ? 'metrics.rho.suggested_rules.escalate' : undefined;
    ruleText = triggerRule ?? suggestedEscalate;
  } else if (decayTwoCycles) {
    level = clamp(level - 1, 0, maxLevel);
    triggerFired = 'rho_sum_stable_or_decreased_two_cycles (decay)';
    ruleSource = decayRule ? 'repair_loop.escalation.decay_rule' : suggestedDecay ? 'metrics.rho.suggested_rules.decay' : undefined;
    ruleText = decayRule ?? suggestedDecay;
    // reset streak after decay action
    decStreak = 0;
  }

  const templates = card?.repair_loop?.templates;

  // Choose action deterministically.
  let action: NextStepResult['action'] = 'continue';
  let templateText = 'Continue normally.';
  let summary = 'No repair/vent trigger fired.';

  // Reference choreography (v0.2 additive). Do NOT harden into a required state machine.
  const choreography = card?.repair_loop?.choreography;
  const hasChoreography = choreography?.profile === 'default_v0_2' && Array.isArray(choreography?.sequence);
  const sequence: string[] = hasChoreography ? choreography.sequence : [];
  const holdMax: number = choreography?.hold_policy?.max_cycles_per_step ?? 2;
  const timeoutAction: string = choreography?.hold_policy?.timeout_action ?? 'vent.tighten_scope';

  // Initialize choreography state if missing.
  const chState = state.choreography ?? { profile: undefined, stepIndex: 0, cyclesInStep: 0 };
  let stepIndex = chState.stepIndex ?? 0;
  let cyclesInStep = chState.cyclesInStep ?? 0;

  const inRepair = level >= 1 || anyHit3 || incTwoCycles;
  if (inRepair) {
    if (hasChoreography && sequence.length > 0) {
      // Reference sequencing: stay on current step up to max cycles, then advance.
      const stepId = sequence[stepIndex] ?? sequence[0];
      const stepToAction: Record<string, NextStepResult['action']> = {
        pause: 'repair.pause',
        restate_invariants: 'repair.restate_invariants',
        specificity: 'repair.specificity',
        reversible_test: 'repair.reversible_test',
        checkpoint: 'repair.checkpoint'
      };
      action = stepToAction[stepId] ?? 'repair.pause';
      const templateKey = stepId as keyof typeof templates;
      templateText = (templates?.[templateKey]?.text) ?? templates?.pause?.text ?? 'We’re drifting. I’m pausing to repair.';
      summary = `Repair mode (reference choreography ${choreography.profile}): step=${stepId}`;

      cyclesInStep += 1;
      if (cyclesInStep >= holdMax) {
        // Advance or timeout.
        cyclesInStep = 0;
        stepIndex += 1;
        if (stepIndex >= sequence.length) {
          // Loop ended: apply timeout action (tighten scope) as a safe default.
          if (timeoutAction === 'vent.tighten_scope') {
            action = 'vent.tighten_scope';
            const vent = (card?.vent_ladder ?? []).find((v: any) => v.name === 'tighten_scope');
            templateText = vent?.action ?? 'Narrow scope; require one concrete next move.';
            summary = `Repair choreography timeout: ${timeoutAction}`;
          }
          stepIndex = 0;
        }
      }
    } else {
      // v0.1 behavior fallback.
      action = 'repair.pause';
      templateText = templates?.pause?.text ?? 'We’re drifting. I’m pausing to repair.';
      summary = 'Entering repair mode to reduce correction cost.';

      if (level >= 3) {
        action = 'vent.partial_vent';
        const vent = (card?.vent_ladder ?? []).find((v: any) => v.name === 'partial_vent');
        templateText = vent?.action ?? 'Refuse destructive frame; keep narrow repair channel.';
        summary = 'Venting (flow redirection) to preserve participation capacity.';
      } else if (level === 2) {
        action = 'repair.specificity';
        templateText = templates?.specificity?.text ?? 'To continue: define constraints and falsifiability.';
        summary = 'Routing conflict into specificity (constraints/falsifiability).';
      }
    }
  }

  const nextState: CoordState = {
    escalation: {
      level,
      prevSum: rhoSum,
      incStreak,
      decStreak
    },
    choreography: {
      profile: hasChoreography ? choreography.profile : undefined,
      stepIndex,
      cyclesInStep
    }
  };

  return {
    action,
    templateText,
    why: {
      triggerFired,
      ruleSource,
      ruleText,
      summary,
      rhoSum,
      incStreak,
      decStreak,
      escalationLevel: level
    },
    state: nextState
  };
}

from __future__ import annotations

from typing import Any, Dict, Optional, Tuple


def _clamp(n: int, lo: int, hi: int) -> int:
    return max(lo, min(hi, n))


def _replace_invariant_ids(template: str, card: Dict[str, Any]) -> str:
    if "{{invariant_ids}}" not in template:
        return template
    invs = card.get("invariants")
    ids = []
    if isinstance(invs, list):
        for x in invs:
            if isinstance(x, dict) and x.get("id"):
                ids.append(str(x["id"]))
    return template.replace("{{invariant_ids}}", ", ".join(ids))


def next_step(card: Dict[str, Any], state: Dict[str, Any], score: Dict[str, Any]) -> Dict[str, Any]:
    """Deterministic next-step logic (Python reference).

    Intended parity with TS reference implementation.
    """

    R = int(score.get("R", 0))
    H = int(score.get("H", 0))
    O = int(score.get("O", 0))
    rho_sum = R + H + O

    max_level = 3
    try:
        max_level = int(card.get("repair_loop", {}).get("escalation", {}).get("max_level", 3))
    except Exception:
        max_level = 3

    esc = state.get("escalation", {}) if isinstance(state, dict) else {}
    prev_sum = esc.get("prevSum")

    increased = prev_sum is not None and rho_sum > prev_sum
    stable_or_decreased = prev_sum is not None and rho_sum <= prev_sum

    inc_streak = int(esc.get("incStreak", 0) or 0)
    dec_streak = int(esc.get("decStreak", 0) or 0)
    level = int(esc.get("level", 0) or 0)

    if prev_sum is None:
        inc_streak = 0
        dec_streak = 0
    else:
        if increased:
            inc_streak += 1
            dec_streak = 0
        elif stable_or_decreased:
            dec_streak += 1
            inc_streak = 0

    any_hit_3 = (R == 3) or (H == 3) or (O == 3)
    inc_two_cycles = inc_streak >= 2
    decay_two_cycles = dec_streak >= 2

    trigger_fired = "none"
    rule_source: Optional[str] = None
    rule_text: Optional[str] = None

    trigger_rule = card.get("repair_loop", {}).get("trigger", {}).get("rule")
    decay_rule = card.get("repair_loop", {}).get("escalation", {}).get("decay_rule")
    suggested_escalate = card.get("metrics", {}).get("rho", {}).get("suggested_rules", {}).get("escalate")
    suggested_decay = card.get("metrics", {}).get("rho", {}).get("suggested_rules", {}).get("decay")

    if any_hit_3:
        level = _clamp(level + 1, 0, max_level)
        trigger_fired = "any_component_hit_3"
        rule_source = "repair_loop.trigger.rule" if trigger_rule else (
            "metrics.rho.suggested_rules.escalate" if suggested_escalate else None
        )
        rule_text = trigger_rule or suggested_escalate
    elif inc_two_cycles:
        level = _clamp(level + 1, 0, max_level)
        trigger_fired = "rho_sum_increased_two_cycles"
        rule_source = "repair_loop.trigger.rule" if trigger_rule else (
            "metrics.rho.suggested_rules.escalate" if suggested_escalate else None
        )
        rule_text = trigger_rule or suggested_escalate
    elif decay_two_cycles:
        level = _clamp(level - 1, 0, max_level)
        trigger_fired = "rho_sum_stable_or_decreased_two_cycles (decay)"
        rule_source = "repair_loop.escalation.decay_rule" if decay_rule else (
            "metrics.rho.suggested_rules.decay" if suggested_decay else None
        )
        rule_text = decay_rule or suggested_decay
        dec_streak = 0

    templates = card.get("repair_loop", {}).get("templates", {})

    action = "continue"
    template_text = "Continue normally."
    summary = "No repair/vent trigger fired."

    # v0.2 reference choreography (optional)
    choreography = card.get("repair_loop", {}).get("choreography")
    has_choreo = isinstance(choreography, dict) and choreography.get("profile") == "default_v0_2" and isinstance(choreography.get("sequence"), list)
    sequence = choreography.get("sequence", []) if has_choreo else []
    hold_max = int(choreography.get("hold_policy", {}).get("max_cycles_per_step", 2)) if has_choreo else 2
    timeout_action = choreography.get("hold_policy", {}).get("timeout_action", "vent.tighten_scope") if has_choreo else "vent.tighten_scope"

    ch_state = state.get("choreography") if isinstance(state, dict) else None
    if not isinstance(ch_state, dict):
        ch_state = {"profile": None, "stepIndex": 0, "cyclesInStep": 0}

    step_index = int(ch_state.get("stepIndex", 0) or 0)
    cycles_in_step = int(ch_state.get("cyclesInStep", 0) or 0)

    in_repair = (level >= 1) or any_hit_3 or inc_two_cycles

    if in_repair:
        if has_choreo and len(sequence) > 0:
            step_id = sequence[step_index] if step_index < len(sequence) else sequence[0]
            step_to_action = {
                "pause": "repair.pause",
                "restate_invariants": "repair.restate_invariants",
                "specificity": "repair.specificity",
                "reversible_test": "repair.reversible_test",
                "checkpoint": "repair.checkpoint",
            }
            action = step_to_action.get(step_id, "repair.pause")

            # template selection
            tmpl_obj = templates.get(step_id) if isinstance(templates, dict) else None
            if isinstance(tmpl_obj, dict) and tmpl_obj.get("text"):
                template_text = str(tmpl_obj["text"])
            else:
                pause_obj = templates.get("pause") if isinstance(templates, dict) else None
                template_text = str(pause_obj.get("text")) if isinstance(pause_obj, dict) and pause_obj.get("text") else "We’re drifting. I’m pausing to repair."

            # convention: auto-populate invariant_ids
            if step_id == "restate_invariants":
                template_text = _replace_invariant_ids(template_text, card)

            summary = f"Repair mode (reference choreography {choreography.get('profile')}): step={step_id}"

            cycles_in_step += 1
            if cycles_in_step >= hold_max:
                cycles_in_step = 0
                step_index += 1
                if step_index >= len(sequence):
                    if timeout_action == "vent.tighten_scope":
                        action = "vent.tighten_scope"
                        vent = None
                        for v in card.get("vent_ladder", []) or []:
                            if isinstance(v, dict) and v.get("name") == "tighten_scope":
                                vent = v
                                break
                        if isinstance(vent, dict) and vent.get("action"):
                            template_text = str(vent["action"])
                        else:
                            template_text = "Narrow scope; require one concrete next move."
                        summary = f"Repair choreography timeout: {timeout_action}"
                    step_index = 0
        else:
            # v0.1 fallback behavior
            action = "repair.pause"
            pause_obj = templates.get("pause") if isinstance(templates, dict) else None
            template_text = str(pause_obj.get("text")) if isinstance(pause_obj, dict) and pause_obj.get("text") else "We’re drifting. I’m pausing to repair."
            summary = "Entering repair mode to reduce correction cost."

            if level >= 3:
                action = "vent.partial_vent"
                vent = None
                for v in card.get("vent_ladder", []) or []:
                    if isinstance(v, dict) and v.get("name") == "partial_vent":
                        vent = v
                        break
                template_text = str(vent.get("action")) if isinstance(vent, dict) and vent.get("action") else "Refuse destructive frame; keep narrow repair channel."
                summary = "Venting (flow redirection) to preserve participation capacity."
            elif level == 2:
                action = "repair.specificity"
                spec_obj = templates.get("specificity") if isinstance(templates, dict) else None
                template_text = str(spec_obj.get("text")) if isinstance(spec_obj, dict) and spec_obj.get("text") else "To continue: define constraints and falsifiability."
                summary = "Routing conflict into specificity (constraints/falsifiability)."

    next_state = {
        "escalation": {
            "level": level,
            "prevSum": rho_sum,
            "incStreak": inc_streak,
            "decStreak": dec_streak,
        },
        "choreography": {
            "profile": choreography.get("profile") if has_choreo else None,
            "stepIndex": step_index,
            "cyclesInStep": cycles_in_step,
        },
    }

    return {
        "action": action,
        "templateText": template_text,
        "why": {
            "triggerFired": trigger_fired,
            "ruleSource": rule_source,
            "ruleText": rule_text,
            "summary": summary,
            "rhoSum": rho_sum,
            "incStreak": inc_streak,
            "decStreak": dec_streak,
            "escalationLevel": level,
        },
        "state": next_state,
    }

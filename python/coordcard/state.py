from __future__ import annotations

from typing import Any, Dict


def init_state() -> Dict[str, Any]:
    """Initialize CoordCard runtime state.

    Mirrors the TS reference shape (includes choreography state).
    """
    return {
        "escalation": {"level": 0, "incStreak": 0, "decStreak": 0},
        "choreography": {"profile": None, "stepIndex": 0, "cyclesInStep": 0},
    }

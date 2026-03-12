import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional

import jsonschema


@dataclass
class ValidationErrorItem:
    path: str
    message: str


@dataclass
class ValidationResult:
    ok: bool
    errors: Optional[list[ValidationErrorItem]] = None


def _load_schema(repo_root: Path, version: str) -> dict[str, Any]:
    filename = "coordcard.v0.2.schema.json" if version == "0.2" else "coordcard.v0.1.schema.json"
    schema_path = repo_root / "schema" / filename
    return json.loads(schema_path.read_text(encoding="utf-8"))


def validate_card(card: Any, repo_root: Optional[str] = None) -> ValidationResult:
    """Validate a CoordCard (v0.1 or v0.2) using the repo JSON Schema.

    repo_root defaults to two directories up from this file (python/coordcard/.. -> python/).
    """
    # Resolve repo root
    if repo_root is None:
        # python/coordcard/validate.py -> python/coordcard -> python -> repo_root
        repo_root_path = Path(__file__).resolve().parents[2]
    else:
        repo_root_path = Path(repo_root).resolve()

    version = "0.1"
    if isinstance(card, dict) and isinstance(card.get("version"), str):
        version = card["version"]

    schema = _load_schema(repo_root_path, version)

    try:
        validator_cls = jsonschema.validators.validator_for(schema)
        validator_cls.check_schema(schema)
        validator = validator_cls(schema)
        errors = sorted(validator.iter_errors(card), key=lambda e: e.path)
    except Exception as e:
        return ValidationResult(ok=False, errors=[ValidationErrorItem(path="", message=str(e))])

    if not errors:
        return ValidationResult(ok=True)

    out: list[ValidationErrorItem] = []
    for e in errors:
        # Instance path is a deque of keys; render as JSON pointer-ish
        if e.path:
            path = "/" + "/".join(str(p) for p in e.path)
        else:
            path = e.schema_path and ("#" + "/".join(str(p) for p in e.schema_path)) or ""
        out.append(ValidationErrorItem(path=path, message=e.message or "invalid"))

    return ValidationResult(ok=False, errors=out)

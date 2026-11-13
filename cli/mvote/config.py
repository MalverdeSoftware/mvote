"""Load and validate item configs (CSV or JSON) for a mVote session.

An item config defines the sticky notes participants will vote on. Each item
needs at minimum an ``id`` and a ``label``; a ``description`` is optional.

JSON format::

    [
      {"id": "var_001", "label": "Depressive symptoms", "description": "..."},
      {"id": "var_002", "label": "Sleep quality"}
    ]

CSV format (header row required)::

    id,label,description
    var_001,Depressive symptoms,...
    var_002,Sleep quality,
"""
from __future__ import annotations

import csv
import json
from dataclasses import dataclass
from pathlib import Path


REQUIRED_FIELDS = ("id", "label")


class ConfigError(ValueError):
    """Raised when an item config file is missing required fields or is malformed."""


@dataclass(frozen=True)
class Item:
    id: str
    label: str
    description: str = ""


def load_items(path: str | Path) -> list[Item]:
    """Load a list of :class:`Item` from a CSV or JSON file.

    Raises:
        ConfigError: if the file is malformed, has duplicate ids, or is
            missing required fields.
        FileNotFoundError: if ``path`` does not exist.
    """
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"Config file not found: {path}")

    if path.suffix.lower() == ".json":
        raw_items = _load_json(path)
    elif path.suffix.lower() == ".csv":
        raw_items = _load_csv(path)
    else:
        raise ConfigError(
            f"Unsupported config file type '{path.suffix}'. Use .csv or .json."
        )

    items = []
    seen_ids = set()
    for i, raw in enumerate(raw_items):
        if not isinstance(raw, dict):
            raise ConfigError(f"Item at index {i} must be an object with id and label.")
        missing = [f for f in REQUIRED_FIELDS if not raw.get(f)]
        if missing:
            raise ConfigError(
                f"Item at index {i} is missing required field(s): {missing}"
            )
        # Compared as text, the way ids are stored: 1 and "1" are the same id.
        item_id = str(raw["id"])
        if item_id in seen_ids:
            raise ConfigError(f"Duplicate item id found: '{item_id}'")
        seen_ids.add(item_id)
        items.append(
            Item(
                id=item_id,
                label=str(raw["label"]),
                description=str(raw.get("description", "") or ""),
            )
        )

    if not items:
        raise ConfigError("Config file contains no items.")

    return items


def _load_json(path: Path) -> list[dict]:
    with path.open("r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            raise ConfigError(f"Config file is not valid JSON: {e}") from e
    if not isinstance(data, list):
        raise ConfigError("JSON config must be a list of item objects.")
    return data


def _load_csv(path: Path) -> list[dict]:
    with path.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        return list(reader)

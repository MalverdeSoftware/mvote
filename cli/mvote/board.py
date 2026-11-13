"""Create and export mVote voting sessions ("boards").

This module intentionally does not depend on any specific backend
(Firebase, etc.) yet — :func:`create_board` returns a plain dict describing
the session, and a backend-specific writer is expected to be layered on top
(see docs/ROADMAP.md, Stage 2). Keeping this backend-agnostic is what lets
someone deploy mVote without being locked into Firebase specifically.
"""
from __future__ import annotations

import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .config import Item, load_items


@dataclass
class Board:
    board_id: str
    title: str
    items: list[Item]
    created_at: str
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict:
        d = asdict(self)
        return d


def create_board(config_path: str | Path, title: str, board_id: str | None = None) -> Board:
    """Build a new :class:`Board` from an item config file.

    Does not persist anything — callers (CLI, backend adapter) are
    responsible for writing the board to a store and generating the
    link/QR code from ``board_id``.
    """
    items = load_items(config_path)
    return Board(
        board_id=board_id or uuid.uuid4().hex[:8],
        title=title,
        items=items,
        created_at=datetime.now(timezone.utc).isoformat(),
    )


def export_results(board: Board, vote_counts: dict[str, int]) -> list[dict]:
    """Produce a tidy, analysis-ready export of vote results.

    Returns one row per item: ``board_id``, ``item_id``, ``label``,
    ``vote_count`` — the structured-data export that is mVote's core
    differentiator versus workshop-oriented dot-voting tools.
    """
    rows = []
    for item in board.items:
        rows.append(
            {
                "board_id": board.board_id,
                "board_title": board.title,
                "item_id": item.id,
                "label": item.label,
                "vote_count": vote_counts.get(item.id, 0),
            }
        )
    return rows

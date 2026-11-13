"""Firestore-backed persistence for mVote boards and votes.

This is the one Firebase-specific module in the project — board.py stays
backend-agnostic on purpose (see its docstring). Swapping to a different
backend later means reimplementing the functions here, not touching board.py.

Every function accepts an optional ``db`` (a Firestore client, or anything
duck-typing its ``collection()``/``document()`` interface) so callers —
tests included — can inject a fake instead of hitting real Firebase.
"""
from __future__ import annotations

import os
from typing import Any

from .board import Board, export_results
from .config import Item

BOARDS_COLLECTION = "boards"
VOTES_SUBCOLLECTION = "votes"


def get_client() -> Any:
    """Return a Firestore client, initializing the Firebase app if needed.

    Credentials come from the ``GOOGLE_APPLICATION_CREDENTIALS`` environment
    variable (a service-account JSON key path) via Firebase's standard
    Application Default Credentials flow — see cli/README.md for setup.
    """
    import firebase_admin
    from firebase_admin import credentials, firestore

    if not firebase_admin._apps:
        cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        if cred_path:
            firebase_admin.initialize_app(credentials.Certificate(cred_path))
        else:
            firebase_admin.initialize_app()
    return firestore.client()


class BoardExistsError(ValueError):
    """Raised when publishing would replace a board that is already there."""


def save_board(board: Board, db: Any = None, overwrite: bool = False) -> None:
    """Write a board and its zero-initialized vote counts to Firestore.

    Publishing sets every count to zero, so a board that already exists is
    left alone unless ``overwrite`` is true.

    Raises:
        BoardExistsError: if the board exists and ``overwrite`` is false.
    """
    db = db or get_client()
    board_ref = db.collection(BOARDS_COLLECTION).document(board.board_id)
    if not overwrite and board_ref.get().exists:
        raise BoardExistsError(
            f"Board '{board.board_id}' already exists. Publishing again would reset its "
            "votes to zero. Choose another --board-id, or pass --overwrite to replace it."
        )
    board_ref.set(
        {
            "title": board.title,
            "created_at": board.created_at,
            "metadata": board.metadata,
            "items": [
                {"id": item.id, "label": item.label, "description": item.description}
                for item in board.items
            ],
        }
    )
    votes_ref = board_ref.collection(VOTES_SUBCOLLECTION)
    for item in board.items:
        votes_ref.document(item.id).set({"count": 0})


def load_board(board_id: str, db: Any = None) -> Board:
    """Fetch a previously-saved board definition from Firestore.

    Raises:
        ValueError: if no board with this id exists.
    """
    db = db or get_client()
    snapshot = db.collection(BOARDS_COLLECTION).document(board_id).get()
    if not snapshot.exists:
        raise ValueError(f"Board '{board_id}' not found.")
    data = snapshot.to_dict()
    items = [
        Item(id=i["id"], label=i["label"], description=i.get("description", ""))
        for i in data["items"]
    ]
    return Board(
        board_id=board_id,
        title=data["title"],
        items=items,
        created_at=data["created_at"],
        metadata=data.get("metadata", {}),
    )


def fetch_vote_counts(board_id: str, db: Any = None) -> dict[str, int]:
    """Read current per-item vote counts for a board from Firestore."""
    db = db or get_client()
    votes_ref = db.collection(BOARDS_COLLECTION).document(board_id).collection(
        VOTES_SUBCOLLECTION
    )
    return {doc.id: (doc.to_dict() or {}).get("count", 0) for doc in votes_ref.stream()}


def export_board_results(board_id: str, db: Any = None) -> list[dict]:
    """Load a board and its live vote counts, and produce the tidy export rows."""
    db = db or get_client()
    board = load_board(board_id, db=db)
    vote_counts = fetch_vote_counts(board_id, db=db)
    return export_results(board, vote_counts)

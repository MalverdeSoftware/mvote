import json

import pytest

from mvote import firebase_store
from mvote.board import create_board


class FakeSnapshot:
    def __init__(self, doc_id, data):
        self.id = doc_id
        self._data = data

    @property
    def exists(self):
        return self._data is not None

    def to_dict(self):
        return self._data


class FakeDocumentRef:
    def __init__(self, store, path):
        self._store = store
        self._path = path

    def set(self, data):
        self._store[self._path] = dict(data)

    def update(self, data):
        self._store[self._path].update(data)

    def get(self):
        return FakeSnapshot(self._path[-1], self._store.get(self._path))

    def collection(self, name):
        return FakeCollectionRef(self._store, self._path + (name,))


class FakeCollectionRef:
    def __init__(self, store, path):
        self._store = store
        self._path = path

    def document(self, doc_id):
        return FakeDocumentRef(self._store, self._path + (doc_id,))

    def stream(self):
        depth = len(self._path) + 1
        return [
            FakeSnapshot(path[-1], data)
            for path, data in self._store.items()
            if len(path) == depth and path[: len(self._path)] == self._path
        ]


class FakeFirestoreClient:
    """Minimal in-memory stand-in for a Firestore client, keyed by path tuples."""

    def __init__(self):
        self._store = {}

    def collection(self, name):
        return FakeCollectionRef(self._store, (name,))


def _write_config(tmp_path):
    p = tmp_path / "items.json"
    p.write_text(json.dumps([
        {"id": "v1", "label": "Sleep quality"},
        {"id": "v2", "label": "Mood", "description": "Overall mood rating"},
    ]))
    return p


def test_save_and_load_board_round_trips(tmp_path):
    db = FakeFirestoreClient()
    board = create_board(_write_config(tmp_path), title="Week 3", board_id="b1")

    firebase_store.save_board(board, db=db)
    loaded = firebase_store.load_board("b1", db=db)

    assert loaded.board_id == board.board_id
    assert loaded.title == board.title
    assert loaded.created_at == board.created_at
    assert loaded.items == board.items


def test_save_board_initializes_zero_vote_counts(tmp_path):
    db = FakeFirestoreClient()
    board = create_board(_write_config(tmp_path), title="Week 3", board_id="b1")

    firebase_store.save_board(board, db=db)

    assert firebase_store.fetch_vote_counts("b1", db=db) == {"v1": 0, "v2": 0}


def test_save_board_leaves_an_existing_board_and_its_votes_alone(tmp_path):
    db = FakeFirestoreClient()
    board = create_board(_write_config(tmp_path), title="T", board_id="b1")
    firebase_store.save_board(board, db=db)
    votes = db.collection("boards").document("b1").collection("votes")
    votes.document(board.items[0].id).set({"count": 5})

    with pytest.raises(firebase_store.BoardExistsError):
        firebase_store.save_board(board, db=db)
    assert firebase_store.fetch_vote_counts("b1", db=db)[board.items[0].id] == 5

    firebase_store.save_board(board, db=db, overwrite=True)
    assert firebase_store.fetch_vote_counts("b1", db=db)[board.items[0].id] == 0


def test_fetch_vote_counts_reflects_updates(tmp_path):
    db = FakeFirestoreClient()
    board = create_board(_write_config(tmp_path), title="Week 3", board_id="b1")
    firebase_store.save_board(board, db=db)

    db.collection("boards").document("b1").collection("votes").document("v1").set({"count": 5})

    assert firebase_store.fetch_vote_counts("b1", db=db) == {"v1": 5, "v2": 0}


def test_load_board_missing_raises():
    db = FakeFirestoreClient()
    with pytest.raises(ValueError, match="not found"):
        firebase_store.load_board("nope", db=db)


def test_export_board_results(tmp_path):
    db = FakeFirestoreClient()
    board = create_board(_write_config(tmp_path), title="Week 3", board_id="b1")
    firebase_store.save_board(board, db=db)
    db.collection("boards").document("b1").collection("votes").document("v1").set({"count": 3})

    rows = firebase_store.export_board_results("b1", db=db)

    assert rows == [
        {"board_id": "b1", "board_title": "Week 3", "item_id": "v1",
         "label": "Sleep quality", "vote_count": 3},
        {"board_id": "b1", "board_title": "Week 3", "item_id": "v2",
         "label": "Mood", "vote_count": 0},
    ]


def test_save_board_starts_open(tmp_path):
    db = FakeFirestoreClient()
    config = tmp_path / "items.json"
    config.write_text(json.dumps([{"id": "a", "label": "A"}]))
    board = create_board(config, title="T", board_id="b1")
    firebase_store.save_board(board, db=db)
    assert db.collection("boards").document("b1").get().to_dict()["closed"] is False


def test_set_board_closed_and_reopen(tmp_path):
    db = FakeFirestoreClient()
    config = tmp_path / "items.json"
    config.write_text(json.dumps([{"id": "a", "label": "A"}]))
    firebase_store.save_board(create_board(config, title="T", board_id="b1"), db=db)

    firebase_store.set_board_closed("b1", True, db=db)
    assert db.collection("boards").document("b1").get().to_dict()["closed"] is True
    firebase_store.set_board_closed("b1", False, db=db)
    assert db.collection("boards").document("b1").get().to_dict()["closed"] is False


def test_set_board_closed_missing_board():
    with pytest.raises(ValueError, match="not found"):
        firebase_store.set_board_closed("nope", True, db=FakeFirestoreClient())


def test_board_status_counts_participants_done_and_dots(tmp_path):
    db = FakeFirestoreClient()
    config = tmp_path / "items.json"
    config.write_text(json.dumps([{"id": "a", "label": "A"}, {"id": "b", "label": "B"}]))
    firebase_store.save_board(create_board(config, title="T", board_id="b1"), db=db)
    board = db.collection("boards").document("b1")
    board.collection("votes").document("a").set({"count": 5})
    board.collection("votes").document("b").set({"count": 2})
    board.collection("participants").document("p1").set({"remaining_dots": 1, "done": True})
    board.collection("participants").document("p2").set({"remaining_dots": 8})
    board.collection("participants").document("p3").set({"remaining_dots": 0, "done": False})

    assert firebase_store.board_status("b1", db=db) == {
        "closed": False, "participants": 3, "done": 1, "dots_placed": 7,
    }


def test_board_status_missing_board():
    with pytest.raises(ValueError, match="not found"):
        firebase_store.board_status("nope", db=FakeFirestoreClient())


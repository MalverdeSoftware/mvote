import json

from mvote.board import create_board, export_results


def _write_config(tmp_path):
    p = tmp_path / "items.json"
    p.write_text(json.dumps([
        {"id": "v1", "label": "Sleep quality"},
        {"id": "v2", "label": "Mood"},
    ]))
    return p


def test_create_board(tmp_path):
    config = _write_config(tmp_path)
    board = create_board(config, title="Test Session")
    assert board.title == "Test Session"
    assert len(board.items) == 2
    assert board.board_id  # non-empty


def test_create_board_fixed_id(tmp_path):
    config = _write_config(tmp_path)
    board = create_board(config, title="Test Session", board_id="fixed123")
    assert board.board_id == "fixed123"


def test_export_results(tmp_path):
    config = _write_config(tmp_path)
    board = create_board(config, title="Test Session", board_id="b1")
    rows = export_results(board, vote_counts={"v1": 5})
    assert rows == [
        {"board_id": "b1", "board_title": "Test Session", "item_id": "v1",
         "label": "Sleep quality", "vote_count": 5},
        {"board_id": "b1", "board_title": "Test Session", "item_id": "v2",
         "label": "Mood", "vote_count": 0},
    ]

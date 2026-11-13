import json

from click.testing import CliRunner

from mvote.cli import main


def _write_config(tmp_path):
    p = tmp_path / "items.json"
    p.write_text(json.dumps([{"id": "v1", "label": "Sleep quality"}]))
    return p


def test_create_without_publish_does_not_touch_firebase(tmp_path, monkeypatch):
    calls = []
    monkeypatch.setattr(
        "mvote.cli.firebase_store.save_board",
        lambda board, db=None: calls.append(board),
    )

    result = CliRunner().invoke(main, [
        "create", "--config", str(_write_config(tmp_path)), "--title", "T",
    ])

    assert result.exit_code == 0
    assert calls == []


def test_create_with_publish_writes_board_and_prints_link(tmp_path, monkeypatch):
    calls = []
    monkeypatch.setattr(
        "mvote.cli.firebase_store.save_board",
        lambda board, db=None: calls.append(board),
    )
    monkeypatch.delenv("MVOTE_WEBAPP_URL", raising=False)

    result = CliRunner().invoke(main, [
        "create", "--config", str(_write_config(tmp_path)), "--title", "T",
        "--board-id", "b1", "--publish", "--base-url", "https://example.com/vote",
    ])

    assert result.exit_code == 0, result.output
    assert len(calls) == 1
    assert calls[0].board_id == "b1"
    assert "Participant link: https://example.com/vote/b1" in result.output


def test_create_with_publish_uses_placeholder_url_when_unset(tmp_path, monkeypatch):
    monkeypatch.setattr("mvote.cli.firebase_store.save_board", lambda board, db=None: None)
    monkeypatch.delenv("MVOTE_WEBAPP_URL", raising=False)

    result = CliRunner().invoke(main, [
        "create", "--config", str(_write_config(tmp_path)), "--title", "T",
        "--board-id", "b1", "--publish",
    ])

    assert result.exit_code == 0, result.output
    assert "mvote.example/vote/b1" in result.output


def test_results_writes_csv(monkeypatch):
    rows = [
        {"board_id": "b1", "board_title": "T", "item_id": "v1",
         "label": "Sleep quality", "vote_count": 4},
    ]
    monkeypatch.setattr(
        "mvote.cli.firebase_store.export_board_results",
        lambda board_id, db=None: rows,
    )

    result = CliRunner().invoke(main, ["results", "--board-id", "b1"])

    assert result.exit_code == 0, result.output
    assert "v1" in result.output
    assert "4" in result.output


def test_results_missing_board_exits_nonzero(monkeypatch):
    def raise_not_found(board_id, db=None):
        raise ValueError(f"Board '{board_id}' not found.")

    monkeypatch.setattr("mvote.cli.firebase_store.export_board_results", raise_not_found)

    result = CliRunner().invoke(main, ["results", "--board-id", "nope"])

    assert result.exit_code == 1
    assert "not found" in result.output

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
        lambda board, db=None, overwrite=False: calls.append(board),
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
        lambda board, db=None, overwrite=False: calls.append(board),
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
    monkeypatch.setattr("mvote.cli.firebase_store.save_board", lambda board, db=None, overwrite=False: None)
    monkeypatch.delenv("MVOTE_WEBAPP_URL", raising=False)

    result = CliRunner().invoke(main, [
        "create", "--config", str(_write_config(tmp_path)), "--title", "T",
        "--board-id", "b1", "--publish",
    ])

    assert result.exit_code == 0, result.output
    assert "mvote.example/vote/b1" in result.output


def test_create_with_publish_refuses_an_existing_board(tmp_path, monkeypatch):
    from mvote.firebase_store import BoardExistsError

    seen = []

    def save(board, db=None, overwrite=False):
        seen.append(overwrite)
        if not overwrite:
            raise BoardExistsError("Board 'b1' already exists.")

    monkeypatch.setattr("mvote.cli.firebase_store.save_board", save)
    args = ["create", "--config", str(_write_config(tmp_path)), "--title", "T",
            "--board-id", "b1", "--publish", "--base-url", "https://example.com/vote"]

    refused = CliRunner().invoke(main, args)
    assert refused.exit_code == 1
    assert "already exists" in refused.output
    assert "Participant link" not in refused.output

    replaced = CliRunner().invoke(main, args + ["--overwrite"])
    assert replaced.exit_code == 0, replaced.output
    assert seen == [False, True]


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


def test_close_and_reopen_call_the_store(monkeypatch):
    calls = []
    monkeypatch.setattr(
        "mvote.cli.firebase_store.set_board_closed",
        lambda board_id, closed, db=None: calls.append((board_id, closed)),
    )
    runner = CliRunner()

    closed = runner.invoke(main, ["close", "--board-id", "b1"])
    reopened = runner.invoke(main, ["reopen", "--board-id", "b1"])

    assert closed.exit_code == 0 and "is closed" in closed.output
    assert reopened.exit_code == 0 and "open for voting again" in reopened.output
    assert calls == [("b1", True), ("b1", False)]


def test_close_missing_board_exits_nonzero(monkeypatch):
    def raise_not_found(board_id, closed, db=None):
        raise ValueError(f"Board '{board_id}' not found.")

    monkeypatch.setattr("mvote.cli.firebase_store.set_board_closed", raise_not_found)
    result = CliRunner().invoke(main, ["close", "--board-id", "nope"])
    assert result.exit_code == 1
    assert "not found" in result.output


def test_status_prints_summary(monkeypatch):
    monkeypatch.setattr(
        "mvote.cli.firebase_store.board_status",
        lambda board_id, db=None: {"closed": False, "participants": 13, "done": 9, "dots_placed": 142},
    )
    result = CliRunner().invoke(main, ["status", "--board-id", "b1"])
    assert result.exit_code == 0
    assert "is open: 9 of 13 participants done, 142 dots placed." in result.output


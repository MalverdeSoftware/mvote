"""Command-line interface for creating mVote voting sessions."""
from __future__ import annotations

import csv
import json
import os
import sys
from pathlib import Path

import click

from . import firebase_store
from .board import create_board
from .config import ConfigError

DEFAULT_BASE_URL_ENV = "MVOTE_WEBAPP_URL"
PLACEHOLDER_BASE_URL = "https://mvote.example/vote"
RESULT_FIELDS = ["board_id", "board_title", "item_id", "label", "vote_count"]


@click.group()
@click.version_option()
def main():
    """mVote: create participatory sticky-note voting sessions."""


@main.command("create")
@click.option("--config", "config_path", required=True, type=click.Path(exists=True),
              help="Path to a CSV or JSON item config file.")
@click.option("--title", required=True, help="Title for this session (e.g. 'Week 3').")
@click.option("--board-id", default=None, help="Optional fixed board id; random if omitted.")
@click.option("--out", "out_path", default=None, type=click.Path(),
              help="Write the board definition (JSON) to this path instead of stdout.")
@click.option("--publish/--no-publish", default=False,
              help="Also write the board to Firebase and print a shareable link + QR code.")
@click.option("--overwrite", is_flag=True, default=False,
              help="With --publish, replace a board that already has this id. Its vote counts "
                   "return to zero; dots participants already spent stay spent.")
@click.option("--base-url", default=None,
              help=f"Webapp base URL for the shareable link (or set {DEFAULT_BASE_URL_ENV}). "
                   "Only used with --publish.")
@click.option("--qr-out", "qr_out_path", default=None, type=click.Path(),
              help="Save the shareable link's QR code as a PNG to this path (only with --publish; "
                   "prints an ASCII QR code to the terminal if omitted).")
def create(config_path: str, title: str, board_id: str | None, out_path: str | None,
           publish: bool, overwrite: bool, base_url: str | None, qr_out_path: str | None):
    """Create a new board from an item config file.

    With --publish, also writes the board to Firestore (see cli/README.md
    for the required GOOGLE_APPLICATION_CREDENTIALS setup) and prints a
    shareable participant link and QR code.
    """
    try:
        board = create_board(config_path, title=title, board_id=board_id)
    except ConfigError as e:
        click.echo(f"Config error: {e}", err=True)
        sys.exit(1)

    payload = board.to_dict()
    text = json.dumps(payload, indent=2, default=str)

    if out_path:
        Path(out_path).write_text(text, encoding="utf-8")
        click.echo(f"Board '{board.board_id}' written to {out_path}")
    else:
        click.echo(text)

    if publish:
        try:
            firebase_store.save_board(board, overwrite=overwrite)
        except firebase_store.BoardExistsError as e:
            click.echo(str(e), err=True)
            sys.exit(1)
        click.echo(f"Board '{board.board_id}' published to Firestore.")

        resolved_base_url = base_url or os.environ.get(DEFAULT_BASE_URL_ENV)
        if not resolved_base_url:
            resolved_base_url = PLACEHOLDER_BASE_URL
            click.echo(
                f"Note: no webapp URL configured (--base-url or {DEFAULT_BASE_URL_ENV}); "
                "using a placeholder until the webapp is deployed.",
                err=True,
            )
        link = f"{resolved_base_url.rstrip('/')}/{board.board_id}"
        click.echo(f"Participant link: {link}")

        import qrcode

        if qr_out_path:
            qrcode.make(link).save(qr_out_path)
            click.echo(f"QR code written to {qr_out_path}")
        else:
            qr = qrcode.QRCode()
            qr.add_data(link)
            qr.print_ascii()


@main.command("results")
@click.option("--board-id", required=True, help="Id of a board previously created with --publish.")
@click.option("--out", "out_path", default=None, type=click.Path(),
              help="Write results as CSV to this path instead of stdout.")
def results(board_id: str, out_path: str | None):
    """Fetch live vote counts for a published board and export tidy results."""
    try:
        rows = firebase_store.export_board_results(board_id)
    except ValueError as e:
        click.echo(str(e), err=True)
        sys.exit(1)

    if out_path:
        with open(out_path, "w", newline="", encoding="utf-8") as f:
            _write_results(f, rows)
        click.echo(f"Results for board '{board_id}' written to {out_path}")
    else:
        _write_results(sys.stdout, rows)


@main.command("close")
@click.option("--board-id", required=True, help="Id of a published board.")
def close(board_id: str):
    """Stop a board from taking votes. Its counts stay visible and exportable."""
    _set_closed(board_id, True)


@main.command("reopen")
@click.option("--board-id", required=True, help="Id of a closed board.")
def reopen(board_id: str):
    """Let a closed board take votes again."""
    _set_closed(board_id, False)


def _set_closed(board_id: str, closed: bool) -> None:
    try:
        firebase_store.set_board_closed(board_id, closed)
    except ValueError as e:
        click.echo(str(e), err=True)
        sys.exit(1)
    if closed:
        click.echo(f"Board '{board_id}' is closed. Participants can see the counts but can't vote.")
    else:
        click.echo(f"Board '{board_id}' is open for voting again.")


def _write_results(stream, rows: list[dict]) -> None:
    writer = csv.DictWriter(stream, fieldnames=RESULT_FIELDS)
    writer.writeheader()
    writer.writerows(rows)


if __name__ == "__main__":
    main()

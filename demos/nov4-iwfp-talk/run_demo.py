"""Day-of bridge: mVote results -> top-voted items -> LASSO model.

Usage (live, pulls results straight from Firestore):
    .venv/bin/python3 run_demo.py --board-id <board-id>

Usage (offline fallback, e.g. if venue wifi drops after voting closes):
    .venv/bin/python3 run_demo.py --results-csv results.csv
"""
from __future__ import annotations

import argparse
import csv
import io
import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path

import pandas as pd

from pipeline import OUTCOME_COLUMN, format_report, run_lasso
from synthetic_data import generate

HERE = Path(__file__).resolve().parent
CV_REPO = HERE.parents[1]
DATASET_PATH = HERE / "synthetic_chks_dataset.csv"
ITEMS_PATH = CV_REPO / "examples" / "chks_example.json"
OUTPUT_DIR = HERE / "outputs"

BANNER = ("SYNTHETIC DATA -- fake respondents calibrated to published IWFP aggregates.\n"
          "For demonstration only. Not real CHKS data.")


def fetch_results_from_firestore(board_id: str) -> list[dict]:
    """Pull vote counts via the mVote CLI (needs its venv + creds)."""
    env = {**os.environ, "PYTHONPATH": str(CV_REPO / "cli")}
    if "GOOGLE_APPLICATION_CREDENTIALS" not in env:
        env["GOOGLE_APPLICATION_CREDENTIALS"] = str(
            Path.home() / ".config/mvote/serviceAccountKey.json"
        )
    proc = subprocess.run(
        [str(CV_REPO / ".venv/bin/python3"), "-m", "mvote.cli", "results", "--board-id", board_id],
        capture_output=True,
        text=True,
        env=env,
        cwd=CV_REPO,
    )
    if proc.returncode != 0:
        sys.exit(f"Couldn't fetch results for board '{board_id}':\n{proc.stderr.strip()}")
    return list(csv.DictReader(io.StringIO(proc.stdout)))


def read_results_csv(path: Path) -> list[dict]:
    with path.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def top_voted(rows: list[dict], n: int) -> tuple[list[dict], bool]:
    """Return the top-n voted items (excluding the outcome and zero-vote items).

    Items tied with the n-th place are all kept rather than cut arbitrarily,
    since every one of them got the same support from the room. Returns
    (ranked rows, whether ties at the cutoff extended the list past n).
    """
    voted = [
        r for r in rows
        if int(r["vote_count"]) > 0 and r["item_id"] != OUTCOME_COLUMN
    ]
    voted.sort(key=lambda r: -int(r["vote_count"]))  # stable: keeps board order within ties
    if n <= 0 or len(voted) <= n:
        return voted, False
    cutoff = int(voted[n - 1]["vote_count"])
    kept = [r for r in voted if int(r["vote_count"]) >= cutoff]
    return kept, len(kept) > n


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--board-id", help="Pull live results from Firestore for this board.")
    source.add_argument("--results-csv", type=Path, help="Use a results CSV saved earlier instead.")
    parser.add_argument("--top", type=int, default=30,
                        help="How many top-voted items to model (default 30; 0 = every item with a vote).")
    args = parser.parse_args()

    rows = fetch_results_from_firestore(args.board_id) if args.board_id else read_results_csv(args.results_csv)
    ranked, extended_by_ties = top_voted(rows, args.top)
    if not ranked:
        sys.exit("No votes recorded on this board yet.")

    labels = {item["id"]: item["label"] for item in json.loads(ITEMS_PATH.read_text())}

    if DATASET_PATH.exists():
        df = pd.read_csv(DATASET_PATH)
    else:
        df = generate()
        df.to_csv(DATASET_PATH, index=False)

    print("=" * 78)
    print(BANNER)
    print("=" * 78)
    print()
    print("What the room voted for:")
    for i, r in enumerate(ranked, start=1):
        votes = int(r["vote_count"])
        print(f"  {i:2d}. {labels.get(r['item_id'], r['label']):45s} {votes:3d} {'vote' if votes == 1 else 'votes'}")
    if extended_by_ties:
        print(f"  (ties at #{args.top} kept, so {len(ranked)} items go into the model)")
    print()
    print(f"Predicting: {labels.get(OUTCOME_COLUMN, OUTCOME_COLUMN)}, "
          f"{len(df)} synthetic respondents, LASSO logistic regression")
    print()

    result = run_lasso(df, [r["item_id"] for r in ranked])
    report = format_report(result, labels)
    print(report)

    # Keep every run so the room's results can be reviewed together afterwards.
    stamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    OUTPUT_DIR.mkdir(exist_ok=True)
    table = pd.DataFrame([
        {
            "rank": i,
            "item_id": r["item_id"],
            "label": labels.get(r["item_id"], r["label"]),
            "votes": int(r["vote_count"]),
            "selected": r["item_id"] in result["selected_features"],
            "odds_ratio_per_sd": result["odds_ratios"][r["item_id"]],
        }
        for i, r in enumerate(ranked, start=1)
    ])
    table.to_csv(OUTPUT_DIR / f"{stamp}_model_results.csv", index=False)
    (OUTPUT_DIR / f"{stamp}_report.txt").write_text(f"{BANNER}\n\n{report}\n")
    print(f"\nSaved to {OUTPUT_DIR.name}/{stamp}_model_results.csv and _report.txt")


if __name__ == "__main__":
    main()

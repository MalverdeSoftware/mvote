# Rehearsal log: Nov 4 AMC lab

**Outcome (Thu Nov 5, 2026):** the lab ran on the morning of Nov 5 and the author reported that the votes and the model both worked. Board `nov4-talk` ended with 13 participant records and 177 dots across 75 of the 84 items (read from Firestore afterwards). The model ran in the notebook, not `run_demo.py`: 55 voted items entered the LASSO, 12 were kept (7 higher risk, 5 protective), 4 were weak or unstable and 39 dropped, all on synthetic data. The official copies of the room's vote totals and the result table are in `nov5-lab-run/` here. The saved notebook run stays in the IWFP repo, `live_vote_demo/` (vqsierra/IWFP#16, merged 0a175b3), next to a blank copy of the notebook, as a public example while this repo is private. No problems were logged in the table below. The Nov 5 Ring UI redesign (#15) and the MalverdeSoftware top bar and footer (#16) were live for the lab.

**Moved (earlier):** the lab moved from Nov 4 to the morning of Thu Nov 5. Board and notebook stayed as they were.

Rehearsal for the Hands-on AI Lab, Wed Nov 4, 2:00–3:00 pm Mountain. Run this on
**Tue Nov 3, before midnight Pacific**, when the Firebase daily limit resets.

- **Test board:** <https://mvote.app/nov4-rehearsal> (QR: `rehearsal-qr.png`)
- **Backup address:** <https://mvote.vsierrajr.workers.dev/nov4-rehearsal>
- **Don't test on:** `nov4-talk` or `nov4-qr.png`. That board is for the room.

To record a result, mark `pass` or `fail` in the Result column and add a note.

## Setup

| Item | Status |
|---|---|
| `nov4-rehearsal` created: 84 items, no `si` outcome item | Done, Nov 3 |
| `nov4-talk` created: 84 items, 0 votes, 0 participants | Done, Nov 3 |
| Both QR images match their board links | Done, Nov 3 (compared with a freshly generated QR; not yet scanned by a phone) |
| Both boards open on the main and backup addresses | Done, Nov 3 (both addresses respond; main address opened in a browser) |
| Laptop browser opened `nov4-rehearsal` | Done, Nov 3 (counts as 1 participant, no votes) |
| Firebase plan | Spark, seen by the author in the console, Nov 3 |

## Devices

| Label | Device and browser | Network |
|---|---|---|
| A | | |
| B | | |
| C | | |

## A. Getting in

| # | Test | Device | Result | Notes |
|---|---|---|---|---|
| A1 | Scan the QR with the phone camera on **wifi**. Board opens within a few seconds. | Phone | pass, network to confirm | Reported Nov 3: QR scanned and page loaded. Wifi or cellular not noted. |
| A2 | Scan the QR on **cellular**. Board opens within a few seconds. | Phone | pass | Reported Nov 3: the quick cellular check worked. |
| A3 | Type the link by hand, as someone who can't scan would. | | | |
| A4 | Open the backup address. Same totals as the main address. | Phone | pass | Reported Nov 3. |
| A5 | Scan the QR from across a room, off the projector or a printed poster. | | | |

## B. Voting on a phone

| # | Test | Device | Result | Notes |
|---|---|---|---|---|
| B1 | Scroll all 84 items. Text is readable and nothing is cut off. | | | |
| B2 | Tap "What's this?" and then "Hide" on a few cards. | | | |
| B3 | Vote. A dot appears and the "dots left" count drops. | | | |
| B4 | Fast double-tap on +. Adds one dot and shows no red error. | | | |
| B5 | Spend all 8 dots, then tap "Request more dots (+4)". Count shows 4. | | pass (from board data) | 34 dots from 3 voters is more than 8 each allows, so extra dots were granted. On-screen count not confirmed. |
| B6 | Reload the page mid-vote. Your dots and votes are still there. | | | |
| B7 | Lock the phone for a minute, then come back. Board still updates and voting still works. | | | |
| B8 | Try to find one particular item. Note how long it takes (no search or headings). | | | |

## C. Several people at once

| # | Test | Device | Result | Notes |
|---|---|---|---|---|
| C1 | Vote on one device. Other screens update within a second or two. | Phone, private windows | pass | Reported Nov 3: votes updated with no problem. |
| C2 | A private browser window counts as a separate person with its own 8 dots. | Private windows | partial | Board recorded 3 voters. Compare with the number of devices and windows used; private windows in one browser can share a session. |
| C3 | Two people tap the same item at the same moment. Both votes count. | | | |
| C4 | Two or more people tap quickly for a minute. No red errors or lost votes. | | | |

## D. Projector and laptop

| # | Test | Device | Result | Notes |
|---|---|---|---|---|
| D1 | Board on the laptop shows live totals. Readable at projector distance. | | | |
| D2 | Decide what to show, since all 84 cards don't fit and aren't ranked. | | | |
| D3 | Display adapter and projector mirroring work on this laptop. | | | |

## E. Model, from the terminal

Use a terminal that starts in the demo folder with the
exports set. This laptop must be the one you'll present from.

```bash
(cd ../.. && PYTHONPATH=cli .venv/bin/python3 -m mvote.cli results --board-id nov4-rehearsal --out demos/nov4-iwfp-talk/backup-rehearsal-results.csv)
```

```bash
.venv/bin/python3 run_demo.py --results-csv backup-rehearsal-results.csv
```

```bash
.venv/bin/python3 run_demo.py --results-csv backup-rehearsal-results.csv --top 0
```

| # | Test | Result | Notes |
|---|---|---|---|
| E1 | Saving results writes `backup-rehearsal-results.csv` and the totals match the board. | | |
| E2 | Model run finishes in a few seconds and shows the synthetic-data banner. | | |
| E3 | The `--top 0` run works. | | |
| E4 | Terminal is readable from the back of the room (Cmd + to enlarge). | | |
| E5 | Practice explaining odds ratios, "kept %" and the 70% rule out loud from a real report. | | |

The summary lines listing risk factors can run past 110 characters, up to 149 in
the dry run, so they may wrap even at the planned window width. Check under E4
whether that matters.

## F. Failure drills

| # | Drill | Expected | Result | Notes |
|---|---|---|---|---|
| F1 | Turn on airplane mode on a phone, then open the board. | After 10 seconds, a message says to try switching networks. | | |
| F2 | Turn airplane mode off again. | Board loads, ideally without a manual reload. | pass | Reported Nov 3: phone had no signal while votes were added from a private window on the computer. Totals updated once the phone reconnected. |
| F3 | Turn on airplane mode mid-vote and tap +. | Note exactly what the person sees, and whether the vote lands afterwards. | | |
| F4 | Turn laptop wifi off, then run the model on the saved results file. | Runs offline. | | |
| F5 | Connect the laptop to your phone's hotspot and save results. | Works over the hotspot. | | |
| F6 | Paper fallback: copy `paper-tally-template.csv`, change a few `vote_count` values, run the model on the copy. | Runs (see below). | | |

**Paper tally rules.** Start from `paper-tally-template.csv`, which has all 84
items at 0. The script stops with an error on a blank count, an item id it doesn't
know, or a file without the `label` column, so only change the numbers.

## G. Notebook

Notebook: <https://github.com/vqsierra/IWFP/blob/main/live_vote_demo/IWFP_live_vote_demo.ipynb>
Local folder: `~/Desktop/Github/IWFP/live_vote_demo`, opened as the project.
To test tonight, set `BOARD_ID = "nov4-rehearsal"` in the Setup cell. **Set it back to `"nov4-talk"` before the lab.**

| # | Test | Result | Notes |
|---|---|---|---|
| G1 | The notebook uses `live_vote_demo/.venv` as the interpreter and Run All finishes. | | |
| G2 | Charts and tables are readable at projector size. | | |
| G3 | With `BOARD_ID = "nov4-talk"` and no votes, it stops with "No votes recorded yet". | pass | Nov 3 command-line run. Nov 4, 10:15 am Pacific at the venue: the notebook saved from the IDE shows the same stop, and a command-line run matched. |
| G4 | Wifi off after one run: Run All uses the saved copy and says NO CONNECTION. | pass in part | Message checked by simulating no connection on Nov 3. Not run in the IDE. |
| G5 | Paper route: copy `paper_tally_template.csv`, change a few counts, set `RESULTS_CSV`, Run All. | pass in part | File loading checked, including a blank count, a typo and a non-number. Not run in the IDE. |
| G6 | Open the GitHub page on the laptop and scroll to the charts. | | |

## Dry runs already done (Nov 3)

Dry runs, not a substitute for the tests above:

- Empty board: `run_demo.py` says "No votes recorded on this board yet."
- Results export from `nov4-rehearsal` writes all 84 items.
- A filled paper tally with 28 voted items ran in 2.7 seconds.
- Blank counts, a mistyped item id and a missing `label` column each stop with a
  Python error, which is why the template exists.

## Board snapshots

| Time (Pacific) | Board | Participants | Voted | Dots on participant records | Dots on item totals | Items with a vote |
|---|---|---|---|---|---|---|
| Nov 3, 9:46 pm | `nov4-rehearsal` | 4 (includes the laptop view, no votes) | 3 | 34 | 34 | 29 |
| Nov 3, 9:46 pm | `nov4-talk` | 0 | 0 | 0 | 0 | 0 |
| Nov 4, 10:16 am, venue network | `nov4-talk` | 0 | 0 | 0 | 0 | 0 |
| Nov 4, 10:21 am | `nov4-talk` | 1 (author's phone, no votes) | 0 | 0 | 0 | 0 |
| Nov 4, 11:15 am (12:15 pm Mountain) | `nov4-talk` | 2 | 0 | 0 | 0 | 0 |

## Venue check (Nov 4, 10:16 am Pacific, laptop only)

Main address, backup address, GitHub and the Firebase service all respond from the
laptop on the venue network. The author scanned the `nov4-talk` QR on a phone at the
site and the board loaded (wifi or cellular not noted). The projector and scanning
from across the room aren't tested yet.

## Problems found

| # | Time | What happened | Device and network | Severity | Fix or workaround | Status |
|---|---|---|---|---|---|---|
| 1 | | | | | | |

Severity: **blocker** (stops the lab), **workaround** (can talk or route around it),
**later** (after the talk).

## After the rehearsal

- [x] Backups saved: `rehearsal_votes.csv` in the IWFP notebook folder has all 37 dots; `backup-rehearsal-results.csv` here has 34. Notebook runs are in its `results/` folder.
- [x] `nov4-rehearsal` deleted by the author, Nov 3; confirmed gone.
- [x] `nov4-talk` confirmed after the deletion: 84 items, 0 votes, 0 participants.
- [x] Results copied to VOTE-3.

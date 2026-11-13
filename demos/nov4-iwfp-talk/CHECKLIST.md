# Nov 4 talk checklist

Commands assume this Mac. "Repo root" is `~/Desktop/malverde/Projects/mvote`;
"demo folder" is `demos/nov4-iwfp-talk/` inside it. In every new terminal, first run:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=~/.config/mvote/serviceAccountKey.json
export MVOTE_WEBAPP_URL=https://mvote.app
```

## 1. Decide now: room size vs. the free Firebase plan

Every vote is pushed to every open phone, and each push counts as a Firestore
read. The free (Spark) plan allows 50,000 reads a day; past that, voting stops
for the rest of the day. At about 10 votes per person:

| People | Reads | Share of free daily limit |
|---|---|---|
| 40 | ~21,000 | 41% |
| 50 | ~31,000 | 62% |
| 60 | ~43,000 | 86% |
| 70 | ~57,000 | over the limit |
| 100 | ~112,000 | over the limit |

- [ ] Check the plan: Firebase console → the mVote Firebase project → the plan
      name (Spark or Blaze) is shown at the bottom of the left sidebar.
- [ ] If you expect more than ~50 people and it's on Spark, decide whether to
      move to Blaze (pay-as-you-go; 100 people is roughly $0.07). Set a budget
      alert if you do.
- [ ] Don't rehearse on Nov 4 itself; rehearsal reads count against the same
      day's limit (it resets at midnight Pacific).

## 2. Rehearse with real phones (a day or more before)

Use a separate board id so the real board starts clean. Re-publishing an
existing id resets counts but keeps old participant records.

From the repo root:

```bash
PYTHONPATH=cli .venv/bin/python3 -m mvote.cli create \
  --config demos/nov4-iwfp-talk/demo_board_items.json \
  --title "Rehearsal" --board-id nov4-rehearsal \
  --publish --qr-out demos/nov4-iwfp-talk/rehearsal-qr.png
```

With 3–5 people (or your phone plus private browser windows, each of which is a
new participant):

- [ ] Scan the QR from a phone camera; the board opens in a few seconds on
      **cellular** and on **wifi**.
- [ ] All 84 items scroll and read fine on a phone screen.
- [ ] Voting: dots appear, the "dots left" count drops, and other phones show
      the new totals within a second or two.
- [ ] Spend all 8 dots, then tap "Request more dots (+4)".
- [ ] A fast double-tap adds one dot, not two, and shows no red error.
- [ ] Open the board on the presenting laptop to show live totals on the
      projector. Don't vote from it.
- [ ] Run the model from the demo folder:
      `.venv/bin/python3 run_demo.py --board-id nov4-rehearsal`
- [ ] The terminal is readable from the back of the room: font size up
      (Cmd +) and the window at least ~110 characters wide so report lines
      don't wrap.
- [ ] Keep a labeled backup of the rehearsal votes (see section 5):
      `(cd ../.. && PYTHONPATH=cli .venv/bin/python3 -m mvote.cli results --board-id nov4-rehearsal --out demos/nov4-iwfp-talk/backup-rehearsal-results.csv)`
- [ ] Delete the rehearsal board afterwards (from the repo root):

```bash
PYTHONPATH=cli .venv/bin/python3 -c "
from mvote.firebase_store import get_client
ref = get_client().collection('boards').document('nov4-rehearsal')
for sub in ('votes', 'participants'):
    for d in ref.collection(sub).stream(): d.reference.delete()
ref.delete(); print('deleted')"
```

## 3. Slides and setup (day before)

- [ ] Create the real board (from the repo root):

```bash
PYTHONPATH=cli .venv/bin/python3 -m mvote.cli create \
  --config demos/nov4-iwfp-talk/demo_board_items.json \
  --title "Which factors matter most?" --board-id nov4-talk \
  --publish --qr-out demos/nov4-iwfp-talk/nov4-qr.png
```

- [ ] QR slide: `nov4-qr.png` plus the typed link
      `mvote.app/nov4-talk` for anyone who can't scan.
- [ ] A slide saying the model runs on **synthetic data calibrated to IWFP**,
      not real CHKS responses (the terminal banner says it too).
- [ ] Optional slide on how to read the output: odds ratios, "kept 95%" means
      the item held up in 95 of 100 resamples, and LASSO keeps what predicts
      best rather than what matters most.
- [ ] If presenting from a different laptop, see "Setup on a fresh machine" in
      the README, and copy the service-account key to the same path.

## 4. On the day

- [ ] Before the talk: connect to venue wifi, open the board on the laptop
      (confirms it loads), open a terminal in the demo folder with the two
      exports above.
- [ ] Show the QR slide; give the room about 5 minutes to vote. Watch totals on
      the projected board.
- [ ] When voting closes, **save the results first** (protects against wifi
      dropping), then run:

```bash
(cd ../.. && PYTHONPATH=cli .venv/bin/python3 -m mvote.cli results --board-id nov4-talk --out demos/nov4-iwfp-talk/results.csv)
.venv/bin/python3 run_demo.py --results-csv results.csv          # top 30, ties kept
.venv/bin/python3 run_demo.py --results-csv results.csv --top 0  # every voted item
```

- [ ] Review the output with the room. Each run is saved in `outputs/`.

## 5. If something fails

| Problem | Fallback |
|---|---|
| Board stuck on "Loading board…" for everyone | Check the laptop's connection; try the backup URL `mvote.vsierrajr.workers.dev/nov4-talk`. |
| Venue wifi blocks it for some phones | Ask them to switch to cellular. |
| Red "quota exceeded" errors mid-vote | Free-plan read limit hit (section 1). Stop voting; run the model on the results saved so far. |
| Wifi drops after voting | Run from `results.csv` if it was saved; otherwise use the hotspot from your phone. |
| Voting can't happen at all | Run `run_demo.py --results-csv backup-rehearsal-results.csv` and tell the room these are rehearsal votes, not theirs. |
| `run_demo.py` errors | Check you're in the demo folder and the exports are set; the model runs offline once results are saved. |

## 6. After the talk

- [ ] Keep the files in `outputs/` and `results.csv` (gitignored; anonymous vote
      counts only).
- [ ] Decide whether to keep or delete the `nov4-talk` board in Firestore.
- [ ] Add a short note to VOTE-3: room size, how it went, anything that broke.

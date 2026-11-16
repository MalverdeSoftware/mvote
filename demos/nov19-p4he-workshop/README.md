# P4HE workshop: Nov 19, 2026

*Centering Indigenous Ways of Knowing Through Open-Source Research Tools*, hosted by Partners for Advancing Health Equity on Zoom, 2:30–3:30 PM CT.

Attendees vote once on 25 plain-language factors. Their votes go into an IWFP-style LASSO model on **synthetic data**, and the presenter screen-shares the results in PyCharm to review them together. This is the same flow as the [Nov 4 talk](../nov4-iwfp-talk/README.md), cut down for a general health equity audience.

- **Board items:** [`p4he_board_items.json`](p4he_board_items.json). The 25 items come from the Nov 4 board (all ids exist in the synthetic data), with plain-language labels. They're spread across feelings, body, relationships and community, safety and environment, and substances.
- **Notebook:** `vqsierra/IWFP` → `live_vote_demo/P4HE_live_vote_demo.ipynb` (highlights only).
- **Slides and plan:** the presenter's iCloud talk folder (`1 p4he/P4HE-PLAN.md`).

## Board settings

- Board id: `p4he-nov19`
- Title: "Which factors matter most for youth wellbeing?"
- Dots: 5 per person
- Voting time: 12 minutes (slides 14 → live board)

## Day before (Nov 18): publish and rehearse

From the repo root, with network:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=~/.config/mvote/serviceAccountKey.json
export MVOTE_WEBAPP_URL=https://mvote.app
PYTHONPATH=cli .venv/bin/python3 -m mvote.cli create \
  --config demos/nov19-p4he-workshop/p4he_board_items.json \
  --title "Which factors matter most for youth wellbeing?" --board-id p4he-nov19 \
  --publish --qr-out demos/nov19-p4he-workshop/p4he-qr.png
```

Put `p4he-qr.png` and the short link on the vote slide. Rehearse on a separate board (`p4he-rehearsal`) so the real board starts empty, then run the notebook against it.

**Don't merge anything into mvote `main` before the talk.** Merging deploys mvote.app.

## During the talk

1. Show the QR slide and read the steps aloud. Keep the live board open in a browser tab.
2. After about 12 minutes, switch to PyCharm and choose Run All in `P4HE_live_vote_demo.ipynb` (`BOARD_ID = "p4he-nov19"`).
3. Walk through the five highlight cells.

## Offline fallback

While still connected after voting, save the results:

```bash
PYTHONPATH=cli .venv/bin/python3 -m mvote.cli results \
  --board-id p4he-nov19 --out demos/nov19-p4he-workshop/results.csv
```

The notebook also saves a copy to `results/` as soon as it reads the live board, and falls back to that copy if the connection drops. Pre-rendered result slides are the last resort.

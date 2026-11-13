# Live demo: mVote → IWFP-style LASSO (Nov 4, 2026 talk)

The room votes on CHKS constructs in mVote. Their top-voted items
then go into a LASSO logistic regression predicting suicidal ideation, the same
kind of model as the Indigenous Wholistic Factors Project (IWFP). The room keeps
its votes, even if that means 30+ features (that's what a real CBPR process
produces), and the output is reviewed together. Tracked in YouTrack VOTE-3.

The commands, addresses and key paths in this folder were updated to the current mVote names in November 2026. The talk itself ran on an earlier address, and its boards were copied to the current Firebase project.

**All modeling runs on synthetic data** (`synthetic_data.py`). Real CHKS data is
privacy-protected and not in the public [IWFP repo](https://github.com/vqsierra/IWFP),
and its sensitive items shouldn't be run live in a room even if they were
available. Every run prints a banner saying the data are synthetic.

## Nov 5, 2026 lab record

This is the official record of the session. The lab moved from Nov 4 to Nov 5,
and the board kept the name `nov4-talk`.

- [`nov5-lab-run/nov5_lab_votes.csv`](nov5-lab-run/nov5_lab_votes.csv): the room's
  dots per item.
- [`nov5-lab-run/nov5_lab_model_results.csv`](nov5-lab-run/nov5_lab_model_results.csv):
  the model's result table.

The model ran in the notebook in the public IWFP repo (`live_vote_demo/`), which
keeps the saved run as a public example while this repo is private. When this repo
goes public, move the saved run here and leave a link behind. These files hold
per-item totals only. The board also keeps one record per participant, with that
person's votes and remaining dots; those aren't copied here. See `REHEARSAL-LOG.md`
for the outcome.

## Day-of runbook

All commands run from this folder: `demos/nov4-iwfp-talk/`.

Before the talk (once, with network):

```bash
export GOOGLE_APPLICATION_CREDENTIALS=~/.config/mvote/serviceAccountKey.json
export MVOTE_WEBAPP_URL=https://mvote.app
cd ../..   # repo root
PYTHONPATH=cli .venv/bin/python3 -m mvote.cli create \
  --config demos/nov4-iwfp-talk/demo_board_items.json \
  --title "Which factors matter most?" --board-id nov4-talk \
  --publish --qr-out demos/nov4-iwfp-talk/nov4-qr.png
```

Put `nov4-qr.png` on a slide. The board uses `demo_board_items.json`: the 84
items from `examples/chks_example.json`, with `si` left out because it's the
outcome being predicted.

During the talk, after voting closes:

```bash
.venv/bin/python3 run_demo.py --board-id nov4-talk          # room's top 30 (ties kept)
.venv/bin/python3 run_demo.py --board-id nov4-talk --top 0  # every item with a vote
```

Each run is saved to `outputs/` (a results CSV plus the printed report) for
reviewing with the room afterwards. A 42-item run takes about 3.5 seconds.

Offline fallback, in case wifi drops after voting: save results while still
connected, then run from the file.

```bash
(cd ../.. && PYTHONPATH=cli .venv/bin/python3 -m mvote.cli results \
  --board-id nov4-talk --out demos/nov4-iwfp-talk/results.csv)
.venv/bin/python3 run_demo.py --results-csv results.csv
```

## The synthetic data

2,609 fake respondents calibrated to published IWFP aggregates (Sierra 2026,
*Archives of Suicide Research* 30(1):80-97,
[PMC12424082](https://pmc.ncbi.nlm.nih.gov/articles/PMC12424082/)): 16.8% SI
(the generated sample has 17.0%) and the Table 1 prevalences for gender,
transgender, sexual minority, depressive symptoms, foster care (the same 9
cases), homelessness and breakfast. Response formats follow the CHKS codebook
(`examples/chks_full_feature_reference.csv`) and the IWFP predictor appendix.

Items share five correlated latent factors (distress, victimization, substance
involvement, connectedness/support, structural adversity), the way real survey
items cluster. Sexual and gender minority status raise distress and
victimization. Run on IWFP's own 17 predictors, the synthetic data reproduce
the published pattern: depressive symptoms strongest, then victimization and
sexual minority status, small substance effects, and foster care,
homelessness, cigarettes and academic performance not holding up (AUC 0.83
vs. the published 0.87).

Constructs IWFP didn't measure (hopelessness, loneliness, connectedness and
others) have literature-informed directions and demo-chosen sizes. They are
settings, not findings. Connectedness/support has an independent protective
effect, with direct terms for family support, community connectedness and
school connectedness, so the room's support items can survive selection
instead of always losing to distress items.

The random seed follows a stated rule (see `DEFAULT_SEED`): the first seed
where no item with zero true effect is associated with SI. In an earlier seed,
race came out as a stable "risk factor" from sampling chance alone.

## Method

- LASSO logistic regression on standardized items; odds ratios are per 1 SD.
- The penalty uses the one-standard-error rule (glmnet's `lambda.1se`). Tuning
  purely for best AUC let noise items survive with small, arbitrary-direction
  effects. The paper retained several near-zero coefficients (0.00 to 0.10);
  this rule is stricter and drops those.
- The reported AUC is nested 5-fold cross-validation: the penalty is re-chosen
  inside each outer fold.
- An item counts as a finding only if it's kept, its odds ratio is outside
  0.98 to 1.02, and LASSO keeps it in at least 70% of 100 bootstrap resamples.
  Anything else is shown as "weak or unstable" or "dropped."
- Items tied at the top-N cutoff are all kept, and the output says so.
- LASSO keeps what predicts best, not what matters most for prevention.
  Correlated items compete: in a simulated room, family support and school
  connectedness held up, while community connectedness and "support from
  adults in community" split the same signal and both came out unstable.
  That's worth naming when reviewing the output together.

## Setup on a fresh machine

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python3 synthetic_data.py   # regenerates synthetic_chks_dataset.csv (seeded, reproducible)
```

mVote's CLI is run as `PYTHONPATH=cli python -m mvote.cli`
from the repo root rather than the `mvote` entry point. On this
Mac the repo's `.venv` Python skips `.pth` files, so the editable install
doesn't resolve.

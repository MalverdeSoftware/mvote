# Getting started (facilitator guide)

This guide is for when you have a session coming up and want to know what to do. To set up a new Firebase project or deployment from scratch, see [cli/README.md](../cli/README.md) and [webapp/README.md](../webapp/README.md). This page assumes that's already done, which it is for mvote.app.

## One-time setup

1. **Install Python 3.9 or newer** if you don't have it.
2. **Install the command line tool** from [PyPI](https://pypi.org/project/mvote/):

   ```bash
   pip install mvote
   ```

   To try changes that haven't been released yet, install from GitHub instead: `pip install "git+https://github.com/MalverdeSoftware/mvote.git#subdirectory=cli"`.

3. **Get a Firebase service account key.** You only need this to publish a live session you can share. If you just want to preview a config on your own computer, skip it. In the Firebase Console, go to Project Settings, then Service Accounts, then Generate new private key. Save the file outside any git repo and point the tool at it:

   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/your-key.json
   ```

## Running a session

1. **Prepare your item list.** Use a CSV or JSON file with one row or object per item, with an `id`, a `label`, and an optional `description`. You can reuse `examples/chks_example.json` (85 CHKS concepts) or write your own. [examples/README.md](../examples/README.md) shows the format.

2. **Create and publish the board:**

   ```bash
   mvote create \
     --config path/to/items.json \
     --title "Week 3 discussion" \
     --publish \
     --base-url https://mvote.app
   ```

   This prints a participant link (`https://mvote.app/<board-id>`) and a QR code in your terminal. Add `--qr-out qr.png` to save the QR code as an image for a slide or a handout.

3. **Share the link or QR code.** Participants don't need an account or an app. A browser is enough.

4. **Participants vote live.** Each person gets 8 dots and can put more than one on a favorite item. After they use all 8, they can ask for 4 more. Votes update in real time for everyone.

5. **Close voting when the session ends,** then pull the results:

   ```bash
   mvote close --board-id <board-id>
   mvote results --board-id <board-id> --out results.csv
   ```

   Closing stops new votes, so the counts you export stay final even if the link keeps circulating. Participants still see the board, with a note that voting has ended. `mvote reopen --board-id <board-id>` lets it take votes again.

   You get one row per item with `board_id`, `board_title`, `item_id`, `label`, and `vote_count`, ready for a spreadsheet or your analysis code.

## Good to know

- Board IDs are random 8-character strings unless you set one with `--board-id`. A memorable ID makes a more predictable link.
- A session takes votes until you run `mvote close`.
- Participants don't have accounts, so someone who clears their browser or switches devices gets a fresh set of dots. mVote is meant for sessions with a facilitator in the room.
- You can run `results` again at any time. It gives the current tally, so it's safe to check on a session while it's running.

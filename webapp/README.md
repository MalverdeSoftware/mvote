# mVote web app

This is the page participants use to vote. There is no sign-in. A participant opens the facilitator's link (`/{boardId}`), gets a budget of dots, and taps "+" to put dots on the items they care about.

## How voting works

- Each participant starts with **8 dots** and can put more than one on a favorite item.
- When all 8 are used, a **"Request more dots (+4)"** button appears. Participants can ask for another 4 as many times as they like while the session runs.
- Dots show up as a scattered cluster of colored circles on each item, not only a number. It echoes the sticky-dot activity this tool replaces.

## Interface

Screens follow the [UI spec](https://github.com/MalverdeSoftware/malverdesoftware/blob/main/docs/specs/SPEC-ui.md) through the bundled `@malverdesoftware/ui` package. Run `npm run check:ui` to check what a script can see. The open-source components, icons, and fonts the interface uses are listed in [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md). Dot positions and card heights stay fixed as votes arrive, so a "+" never moves under someone's finger.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in your Firebase project's web config
npm run dev
```

To work on the interface without a Firebase project, set `VITE_USE_MOCK=true` in `.env.local`. The app then runs against an in-memory demo board (see `src/data/mockBoardStore.js`). That data lasts for one page load and doesn't survive a reload the way the real Firestore store does.

## Data model (Firestore)

The command line tool writes these when a facilitator runs `mvote create --publish` (`cli/mvote/firebase_store.py`):

- `boards/{boardId}`: title and items (id, label, description)
- `boards/{boardId}/votes/{itemId}`: `{ count }`, created at 0 for each item

The web app writes:

- `boards/{boardId}/participants/{participantId}`: `{ remaining_dots, votes }`, one per anonymous participant (the id is made in the browser and kept in `localStorage`)

### Per-participant dot colors (optional, off by default)

By default, dots are colored for looks only, cycled by position, with no meaning attached. A plain vote count protects privacy better for youth research data and needs no extra writes. Set `VITE_TRACK_PARTICIPANT_COLORS=true` to color every dot by who placed it, the same on every card, for researchers who want that view. This adds a `placements` array to each `votes/{itemId}` document that records participant ids in vote order.

## Security rules

See `../firestore.rules` at the repo root. Deploy them with:

```bash
firebase deploy --only firestore:rules
```

The file documents a known limit of this first version. A technically skilled participant could get around the dot budget by calling Firestore directly. Read the comment at the top of that file before you rely on it for anything riskier than a supervised classroom session.

## Testing

```bash
npm test
```

Tests run against the in-memory mock store (`src/data/mockBoardStore.js`), so they need no Firebase project or credentials.

## Deployment

mVote runs as a Cloudflare Worker that serves the static files (see `../wrangler.jsonc` at the repo root). I chose it over Firebase Hosting because my domain (delasierra.io) already lives in Cloudflare, which avoids the SSL certificate conflicts that can come from running Firebase Hosting behind Cloudflare's proxy. Firestore stays the backend wherever the static site is hosted.

Live at:

- https://mvote.app (custom domain)
- https://mvote.vsierrajr.workers.dev (fallback)

`wrangler.jsonc` builds the web app before every deploy, so Workers Builds only needs the deploy command `npx wrangler deploy` from the repo root.

To redeploy after a change, merge to `main`. Cloudflare Workers Builds (Worker `mvote`, connected to MalverdeSoftware/mvote with its own build token) builds and deploys every push to `main`. Preview builds are off, so other branches don't deploy; check them locally with `npm run verify`.

Builds read the Firebase web config from `.env.production`, which is committed on purpose. Those values go to every participant's browser anyway, and a build without them hangs on "Loading board…". After you change that file or the build setup, open a board on the live site to check that it loads.

The custom domain and DNS are managed through the `routes` in `wrangler.jsonc`. Wrangler sets up DNS and SSL automatically because the domain's zone is on the same Cloudflare account. To deploy under a different domain or account, change that one config value.

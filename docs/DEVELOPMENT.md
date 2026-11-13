# Developing mVote

You need Node 24. The `.node-version` file records the version I tested, 24.19.0.

## Check that your changes work

From `webapp/`:

```sh
npm ci
npm run verify
```

`verify` checks your Node version, runs the tests, builds the app, and writes a checksum list of the build files to `.phase0/build-manifest.json`. That list describes your local build. It doesn't mean anything has been deployed. The GitHub workflow runs the same steps on every pull request.

## Try the app without Firebase

```sh
npm run demo
```

This opens an in-memory demo on port 5174. Visit any board address, such as `/demo`, and the demo board loads. It needs no Firebase credentials, never starts Firebase, and resets the votes whenever you reload the page. It shows how the interface behaves. It doesn't show live syncing between people or saving. `npm run build:demo` writes a separate `dist-demo/` folder.

## Python command line tool

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -e './cli[dev]'
.venv/bin/python -m pytest cli/tests -q
```

Create local example boards with `--no-publish`. Publishing a board and fetching live results are separate steps.

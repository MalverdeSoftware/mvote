# mvote (command line tool)

A Python command line tool that creates mVote voting sessions ("boards") from a CSV or JSON file of items.

## Install for development

```bash
cd cli
pip install -e ".[dev]"
```

## Usage

```bash
mvote create --config ../examples/chks_example.json --title "Week 3"
```

This prints the board definition as JSON, or writes it to a file with `--out`. It doesn't touch any backend.

### Publish a session to Firebase

Add `--publish` to also write the board to Firestore and print a link and QR code you can share:

```bash
mvote create --config ../examples/chks_example.json --title "Week 3" --publish
```

Publishing sets every vote count to zero, so the tool won't publish over a board that already exists. Choose another `--board-id`, or add `--overwrite` if you mean to replace the board and start its counts again.

This needs a Firebase project with **Firestore** turned on. Sign the tool in with a service account key. In the Firebase console, go to Project settings, then Service accounts, then Generate new private key. Then set `GOOGLE_APPLICATION_CREDENTIALS` to the downloaded JSON file. **Never commit this file to the repo.**

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
```

The link uses a placeholder domain until you tell the tool where the web app lives. Pass `--base-url` or set `MVOTE_WEBAPP_URL`. Use `--qr-out path.png` to save the QR code as an image instead of printing it.

After participants have voted in the web app, pull the results:

```bash
mvote results --board-id <id> --out results.csv
```

## Tests

```bash
pytest
```

## Releases

Releases follow [SPEC-distribution](https://github.com/MalverdeSoftware/malverdesoftware/blob/main/docs/specs/SPEC-distribution.md). Every run of `.github/workflows/cli-release.yml` builds the sdist and wheel, runs `twine check --strict` and `scripts/check-cli-release.py`, installs the wheel, and keeps the files as a workflow artifact. A `v<version>` tag also publishes to [PyPI](https://pypi.org/project/mvote/) through trusted publishing (OIDC), with no stored token, while the repository variable `PYPI_PUBLISH` is `true`. PyPI never accepts the same version twice, so bump `version` before tagging.

`cli/LICENSE` and `cli/NOTICE` are copies of the root files, so that both the wheel and installs from GitHub include them. After you edit either root file, run `python scripts/check-cli-release.py --fix`; the check fails while the copies differ. Release tags take the form `v<version>` and must match `version` in `pyproject.toml`.

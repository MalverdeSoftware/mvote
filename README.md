# mVote

[![PyPI](https://img.shields.io/pypi/v/mvote)](https://pypi.org/project/mvote/) [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.24206726.svg)](https://doi.org/10.5281/zenodo.24206726) [![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE) [![CLI tests](https://github.com/MalverdeSoftware/mvote/actions/workflows/cli-tests.yml/badge.svg)](https://github.com/MalverdeSoftware/mvote/actions/workflows/cli-tests.yml)

mVote is a sticky-dot voting tool for research and community activities. A group votes on a shared list of items, such as candidate survey variables from a codebook, and the researcher gets the votes back as data. mVote follows an Indigenous-led approach to software: practical tools, open methods, and software that communities and research partners can run themselves.

**Status: early release (0.2).** Live at [mvote.app](https://mvote.app). Open source under the [Apache License 2.0](LICENSE).

## What it does

- **Everyone votes on the same list.** The researcher writes the items in a CSV or JSON file, and the command line tool turns it into a board with a link and a QR code.
- **No accounts.** Participants open the link or scan the code in any browser. They don't sign up, give a name, or install an app.
- **Votes work like sticky dots.** Each participant gets 8 dots and can stack more than one on a favorite item. When they run out, they can ask for 4 more.
- **Everyone sees the votes live.** Dots appear on each item as people vote, and they stay in place so a button never moves under someone's finger.
- **The researcher controls the session.** The tool shows how many people have finished, closes the board to new votes, and reopens it if needed.
- **Results come out as data.** The export is a CSV with one row per item and its vote count, ready for a spreadsheet or analysis code.

## Run a session

You need Python 3.10 or newer.

```bash
pip install mvote
mvote create --config items.json --title "Week 3" --publish
```

This prints a participant link and a QR code. Publishing a live board needs a Firebase service account key, and you can preview a board on your own computer without one. When the session ends:

```bash
mvote close --board-id <board-id>
mvote results --board-id <board-id> --out results.csv
```

For next steps, see the [getting started guide](docs/GETTING_STARTED.md) for running a session, [examples](examples/README.md) for the item file format, and the [statement of need](docs/statement-of-need.md) for why mVote exists. To try changes that haven't been released yet, install the tool from GitHub with `pip install "git+https://github.com/MalverdeSoftware/mvote.git#subdirectory=cli"`.

## Development

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for the quick checks. The voting page is in `webapp/` and the command line tool is in `cli/`.

```bash
# Web app, from webapp/
npm ci
npm run verify
npm run demo        # in-memory demo, no Firebase needed

# Command line tool, from the repo root
python3 -m venv .venv
.venv/bin/python -m pip install -e './cli[dev]'
.venv/bin/python -m pytest cli/tests -q
```

mVote is built with React and Vite, served by a Cloudflare Worker, with Firestore storing boards and votes. The command line tool is Python and is published on [PyPI](https://pypi.org/project/mvote/). Deployment and data-model details are in [webapp/README.md](webapp/README.md) and [cli/README.md](cli/README.md).

## Scope and limits

This release supports one voting mode, sticky-dot voting on a list of text items, for sessions with a facilitator present. Participants have no accounts, so someone who clears their browser or switches devices gets a fresh set of dots, and a technically skilled participant could get around the dot budget by writing to Firestore directly (see the note in `firestore.rules`). Other voting modes and consensus measures are on the [roadmap](docs/ROADMAP.md).

mVote collects and supports research activities. Communities and their university partners govern the data. They decide how the software is run, who gets links, and how results are used. The software doesn't assign data ownership, and it doesn't replace the agreements for your study.

Please use example items while you try out a new deployment. Then go over hosting and study requirements with your research partners before you collect real votes.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Bug reports, feature ideas and questions are welcome. Please don't post participant data or private board links in public issues.

## References

The research behind the voting methods is listed in [references/README.md](references/README.md).

## License and citation

mVote is free, open-source software under the [Apache License 2.0](LICENSE). Copyright 2026 The Johns Hopkins University. Developed by Valentín Quiroz de la Sierra and Marissa Ledesma for MalverdeSoftware, with support from the National Institute on Drug Abuse of the National Institutes of Health under Award Number K99DA066943. The content is solely the responsibility of the authors and does not necessarily represent the official views of the National Institutes of Health. See [NOTICE](NOTICE).

To cite mVote, use the "Cite this repository" button on GitHub or [CITATION.cff](CITATION.cff):

> de la Sierra, V. Q., & Ledesma, M. (2026). *mVote* [Computer software]. MalverdeSoftware. https://doi.org/10.5281/zenodo.24206726

The DOI [10.5281/zenodo.24206726](https://doi.org/10.5281/zenodo.24206726) always resolves to the latest release. Each release also has its own DOI on Zenodo.

The license covers the code only. The MalverdeSoftware, mVote and mPile names and the MalverdeSoftware logo are not licensed (Apache-2.0, Section 6). Research data collected with this software is not covered either. The communities and partners responsible for each activity govern it.

The licenses of the software mVote is built on are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

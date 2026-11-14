# mVote

mVote is a no-account sticky-note voting tool for research and community-based participatory research (CBPR). I built it so a group can vote on a list of items, like candidate survey variables from a codebook, and I can leave with a clean dataset instead of a photo of a whiteboard.

Participants open a link or scan a QR code. They don't make an account. They place dots on the items they care about, and the votes update live for everyone. Results export as a table with one row per item and its vote count.

mVote is live at [mvote.app](https://mvote.app). It is an early release. It is free, open-source software under the [Apache License 2.0](LICENSE).

## Why I built it

Most voting tools were made for business brainstorming. For research, that gets in the way. They ask for accounts, which is a real barrier in community settings. Their free plans limit how many people can join or what you can export. And what comes out is a picture of a meeting, not data. The longer reasoning is in the [statement of need](docs/statement-of-need.md).

## Run a session

```bash
pip install mvote
mvote create --config items.json --title "Week 3" --publish
```

That prints a link and a QR code to share. The command line tool is [on PyPI](https://pypi.org/project/mvote/). To try changes that haven't been released yet, install it from GitHub with `pip install "git+https://github.com/MalverdeSoftware/mvote.git#subdirectory=cli"`. The [getting started guide](docs/GETTING_STARTED.md) walks through the item file format, running the session, and exporting results.

## What's in this repo

```
mvote/
├── webapp/     the voting page participants see
├── cli/        the Python command line tool that creates sessions
├── examples/   example item lists
├── docs/       statement of need, getting started, roadmap
└── .github/    issue templates and tests that run on every pull request
```

## Contributing

Bug reports, feature ideas, and questions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License and citation

mVote is free, open-source software under the [Apache License 2.0](LICENSE). Copyright 2026 The Johns Hopkins University. Developed by Valentín Quiroz de la Sierra and Marissa Ledesma for MalverdeSoftware, with support from the National Institute on Drug Abuse of the National Institutes of Health under Award Number K99DA066943. The content is solely the responsibility of the authors and does not necessarily represent the official views of the National Institutes of Health. See [NOTICE](NOTICE).

To cite mVote, use the "Cite this repository" button on GitHub or [CITATION.cff](CITATION.cff):

> de la Sierra, V. Q., & Ledesma, M. (2026). *mVote* [Computer software]. MalverdeSoftware. https://doi.org/10.5281/zenodo.24206726

The DOI [10.5281/zenodo.24206726](https://doi.org/10.5281/zenodo.24206726) always resolves to the latest release; each release also has its own DOI on Zenodo.

The license covers the code only. The MalverdeSoftware, mVote and mPile names and the MalverdeSoftware logo are not licensed (Apache-2.0, Section 6). Research data collected with this software is not covered either. The communities and partners responsible for each activity govern it.

The licenses of the software mVote is built on are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Sources

The sources behind the voting methods are in [references/](references/README.md).

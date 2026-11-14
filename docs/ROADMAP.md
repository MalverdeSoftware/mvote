# Roadmap

This is where mVote stands and what comes next.

## Done

- [x] Repo set up, with a statement of need and a project name
- [x] Voting page with a list of items loaded from CSV or JSON, live voting, and a hybrid dot-voting mechanic with star and circle stickers
- [x] Participants join by link or QR code with no account
- [x] Python command line tool that creates a session from a config file and prints a link and QR code
- [x] Live at https://mvote.app (a Cloudflare Worker with Firestore behind it).
- [x] Worked example in `examples/chks_example.json`, a curated set of 85 CHKS concepts
- [x] Automated tests for config parsing, session creation, and the export format, run on every pull request
- [x] CONTRIBUTING.md and CODE_OF_CONDUCT.md
- [x] Command line tool published on PyPI as `mvote` 0.1.0 (2026-11-13), through trusted publishing from `.github/workflows/cli-release.yml`

## Next

- [ ] Review and finalize the statement of need
- [x] Add the Apache-2.0 LICENSE, NOTICE with the funding acknowledgment, and `CITATION.cff` (2026-11-12)
- [x] Mint a DOI at the first public release and add it to NOTICE, CITATION.cff and the README (Zenodo, 10.5281/zenodo.24206726)
- [x] Use mVote in a real class or CBPR session: the AIHEC AMC lab on 2026-11-05, with 13 participants and 177 dots (VOTE-3)
- [ ] Tag releases as features land (v0.1.0 tagged and published 2026-11-13)
- [ ] Transfer the PyPI project to the MalverdeSoftware organization once PyPI approves it
- [x] Close a session to new votes (`mvote close`) and tie each vote to a spent dot in the security rules
- [ ] Add more voting modes and basic reliability or consensus measures if sessions call for them

## Decisions

- **Name:** mVote (November 2026), following the MalverdeSoftware `m___` naming convention.
- **License:** Apache-2.0, copyright The Johns Hopkins University (2026-11-12). The JH Open Source Programs Office handles JHU open-source releases that involve nothing patentable; NIH suggests an OSI-approved license when the award names none. Dependency licenses were checked on 2026-11-11 (see [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md)). None of them limits the choice among Apache-2.0, MIT, GPL-3.0, and AGPL-3.0.
- **Backend:** Firebase, chosen because it costs little for occasional use. It is a default, not a requirement, so people who prefer another backend can swap it.

# Contributing to mVote

Thank you for your interest. Issues, questions, and pull requests are welcome. For a security problem, follow [SECURITY.md](SECURITY.md) instead of opening an issue.

mVote is licensed under the [Apache License 2.0](LICENSE). Under Section 5 of the license, contributions you submit are licensed under the same terms.

## Ways to help

- **Bug reports and feature ideas:** open a GitHub issue. For a bug, tell me how to reproduce it. For a feature, describe what you were trying to do, especially if it's a CBPR or research workflow mVote doesn't handle well yet.
- **Code:** fork the repo, make a branch, and open a pull request against `main`. Please add or update tests when behavior changes.
- **Documentation:** the README, the docs folder, and the example files are all open to edits.

## Setting up

### Web app (`webapp/`)

See [webapp/README.md](webapp/README.md).

### Python command line tool (`cli/`)

```bash
cd cli
pip install -e ".[dev]"
pytest
```

## Pull requests

- Keep each pull request to one change. It is easier to review.
- Say why you made the change, not only what changed.
- Update `docs/ROADMAP.md` if your change finishes a roadmap item.

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By taking part, you agree to follow it.

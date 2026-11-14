# Security policy

mVote runs no-account voting sessions at mvote.app. Boards and vote counts are readable by anyone with a board's link, by design; the Firestore security rules (`firestore.rules`) decide what participants may change, and only the facilitator's tool can create boards. A flaw that lets someone create or alter boards, change counts beyond the rules, or reach credentials is a security problem. The rules' known limit, that a determined participant could add votes without spending their own dots, is documented in `firestore.rules`.

## Supported versions

The current release, the `mvote` command-line tool, and the live site at mvote.app. mVote is an early release (0.x); fixes are not backported.

## Reporting a vulnerability

Please don't open a public issue for a security problem. Report it privately through GitHub: on this repository's **Security** tab, choose **Report a vulnerability**. Include what you found, how to reproduce it, and what it could expose.

You'll get an acknowledgment within 7 days. Fixes for confirmed problems ship in a new release, and the advisory is published once a fix is available, with credit to the reporter unless you'd rather not be named.

Never include real participant data, credentials or other secrets in a report. Use synthetic boards.

# Third-party notices

mVote uses third-party software. Each package keeps its own license, and nothing in this repository changes those terms. This summary was generated from `webapp/package-lock.json` and the Python manifests on 2026-11-11. The lockfile's `license` fields are the complete, per-package record.

## Web app (`webapp/`)

336 packages in the lockfile (direct and transitive, runtime and development).

| License | Packages |
|---|---|
| MIT | 242 |
| Apache-2.0 (including one written "Apache 2.0") | 60 |
| ISC | 13 |
| BSD-3-Clause | 13 |
| BSD-2-Clause | 2 |
| MIT-0, 0BSD | 2 |
| OFL-1.1 | 1 |
| CC-BY-4.0 | 1 |
| No license field in the lockfile | 2 |

Items that need attribution or a note:

- **JetBrains Ring UI** (`@jetbrains/ring-ui-built`) and **JetBrains Icons** (`@jetbrains/icons`): Apache-2.0.
- **Mona Sans** (`@fontsource-variable/mona-sans`): SIL Open Font License 1.1. The font license text must stay with any redistributed font files.
- **Firebase JS SDK** (`firebase`): Apache-2.0. Use of Firebase services is separately governed by Google's terms.
- **combokeys**: Apache-2.0 (the package metadata writes it as "Apache 2.0").
- **scrollbar-width**: its npm metadata has no license field. Its GitHub repository (olmokramer/scrollbar-width.js) carries the MIT license, copyright 2014 Olmo Kramer.
- **caniuse-lite**: CC-BY-4.0 data, used by the build toolchain (development dependency).
- **`@malverdesoftware/ui`**: this project's own shared package, installed from npm (0.1.1). It is licensed under Apache-2.0, copyright The Johns Hopkins University, and carries its LICENSE and NOTICE.

## Python CLI and demos (`cli/`, `demos/`)

Direct dependencies: `qrcode`, `click`, `firebase-admin` (CLI); `numpy`, `pandas`, `scikit-learn`, `scipy`, `joblib`, `threadpoolctl` (demo). Their licenses were not machine-checked in this pass. Confirm each from its package metadata before release.

## Review before release

- Re-run this inventory when dependencies change and before the first public release.
- This project's own code is Apache-2.0 (2026-11-12), which is compatible with the Apache-2.0 packages above.

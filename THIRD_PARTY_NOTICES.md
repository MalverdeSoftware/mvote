# Third-party notices

mVote is free, open-source software under the [Apache License 2.0](LICENSE) (see also [NOTICE](NOTICE)). It is built on open-source software by others. Each of those packages keeps its own license, and nothing in this repository changes those terms.

This summary was generated from `webapp/package-lock.json` and the Python package metadata on 2026-11-13. The lockfile records each npm package's license, and each installed package carries its own license file.

## In the live site (mvote.app)

The web app bundles these packages into the page that participants and facilitators load.

| Package | Version | License | Copyright |
|---|---|---|---|
| React, React DOM (`react`, `react-dom`) | 18.3.1 | MIT | Facebook, Inc. and its affiliates |
| JetBrains Ring UI (`@jetbrains/ring-ui-built`) | 7.0.133 | Apache-2.0 | 2000–2016 JetBrains s.r.o. |
| JetBrains Icons (`@jetbrains/icons`) | 5.24.0 | Apache-2.0 | 2010–2017 JetBrains s.r.o. |
| Firebase JavaScript SDK (`firebase`) | 11.10.0 | Apache-2.0 | Google LLC |
| Mona Sans (`@fontsource-variable/mona-sans`) | 5.3.0 | SIL Open Font License 1.1 | 2022 The Mona Sans Project Authors, with Reserved Font Name "Mona" |
| `@malverdesoftware/ui` | 0.1.1 | Apache-2.0 | 2026 The Johns Hopkins University |

- **Mona Sans** is served to browsers as web font files under the [SIL Open Font License 1.1](https://openfontlicense.org/open-font-license-official-text/). The font is not modified.
- **Firebase:** using Firebase services (the database behind mvote.app) is also governed by Google's terms of service.

All 130 runtime packages, including those the packages above depend on:

| License | Packages |
|---|---|
| Apache-2.0 | 58 |
| MIT | 53 |
| BSD-3-Clause | 11 |
| ISC | 5 |
| OFL-1.1 | 1 |
| 0BSD | 1 |
| No license field in npm metadata | 1 |

The one without a license field is **scrollbar-width** 3.1.1. Its own LICENSE file is MIT, copyright 2014 Olmo Kramer. One Apache-2.0 package, **combokeys**, writes its license as "Apache 2.0".

## Build and test tools (not in the live site)

145 development packages run only when building and testing the web app: MIT 121, MPL-2.0 12, Apache-2.0 4, ISC 3, BSD-2-Clause 2, BSD-3-Clause 2, and MIT-0 1. The MPL-2.0 packages are `lightningcss` and its platform binaries, a build tool; MPL-2.0 applies at the file level.

## Python command-line tool (`cli/`)

`pip` installs these alongside the tool; they are not bundled with it.

| Package | License |
|---|---|
| `click` | BSD-3-Clause |
| `qrcode` (with `pillow` for images) | BSD; Pillow is MIT-CMU |
| `firebase-admin` | Apache-2.0. Using Firebase services is also governed by Google's terms |

## Demo (`demos/nov4-iwfp-talk/`)

`numpy` (BSD-3-Clause, with parts under 0BSD, MIT, Zlib and CC0-1.0), `pandas`, `scikit-learn`, and scikit-learn's dependencies `scipy`, `joblib` and `threadpoolctl` (all BSD-3-Clause).

## Keeping this current

This file is regenerated when dependencies change. If you find a missing or wrong attribution, please [open an issue](https://github.com/MalverdeSoftware/mvote/issues).

"""Release dry run for the mvote command-line tool (SPEC-distribution, Phase 0).

Checks that cli/LICENSE and cli/NOTICE match the repo root, then inspects built files in
cli/dist: the wheel must carry both in its .dist-info/licenses folder and declare
License-Expression: Apache-2.0, and the sdist must contain both. Uploads nothing.

Usage, from the repo root:
    python scripts/check-cli-release.py            # copies only (no build needed)
    python scripts/check-cli-release.py --dist     # copies plus the files in cli/dist
    python scripts/check-cli-release.py --fix      # recopy LICENSE and NOTICE into cli/ first
    python scripts/check-cli-release.py --dist --tag v0.1.0   # also check the tag matches the version
"""

from __future__ import annotations

import argparse
import shutil
import sys
import tarfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CLI = ROOT / "cli"
SHARED = ("LICENSE", "NOTICE")


def project_version() -> str:
    for line in (CLI / "pyproject.toml").read_text(encoding="utf-8").splitlines():
        if line.startswith("version"):
            return line.split("=", 1)[1].strip().strip('"')
    raise SystemExit("No version in cli/pyproject.toml")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--fix", action="store_true")
    parser.add_argument("--dist", action="store_true")
    parser.add_argument("--tag")
    args = parser.parse_args()
    problems: list[str] = []

    for name in SHARED:
        if args.fix:
            shutil.copyfile(ROOT / name, CLI / name)
        copy = CLI / name
        if not copy.exists():
            problems.append(f"cli/{name} is missing (run with --fix)")
        elif copy.read_bytes() != (ROOT / name).read_bytes():
            problems.append(f"cli/{name} differs from the root {name} (run with --fix)")

    version = project_version()
    if args.tag and args.tag.removeprefix("v") != version:
        problems.append(f"tag {args.tag} doesn't match version {version} in cli/pyproject.toml")

    if args.dist:
        dist = CLI / "dist"
        wheels = sorted(dist.glob(f"mvote-{version}-*.whl"))
        sdists = sorted(dist.glob(f"mvote-{version}.tar.gz"))
        if not wheels or not sdists:
            problems.append(f"expected a wheel and an sdist for {version} in cli/dist (run python -m build in cli/)")
        for wheel in wheels:
            with zipfile.ZipFile(wheel) as archive:
                names = archive.namelist()
                info = f"mvote-{version}.dist-info"
                for name in SHARED:
                    if f"{info}/licenses/{name}" not in names:
                        problems.append(f"{wheel.name}: {name} missing from {info}/licenses/")
                metadata = archive.read(f"{info}/METADATA").decode("utf-8")
                if "License-Expression: Apache-2.0" not in metadata:
                    problems.append(f"{wheel.name}: METADATA lacks License-Expression: Apache-2.0")
            print(f"{wheel.name}: {len(names)} files")
        for sdist in sdists:
            with tarfile.open(sdist) as archive:
                names = {Path(member).name for member in archive.getnames()}
                for name in SHARED:
                    if name not in names:
                        problems.append(f"{sdist.name}: {name} missing")
            print(f"{sdist.name}: ok")

    if problems:
        print("\nRelease dry run failed:\n- " + "\n- ".join(problems), file=sys.stderr)
        return 1
    print("\nRelease dry run passed. Nothing was uploaded.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

"""Whether the checked-out branch carries a memo channel (`scripts/memo/memo.py`):
`memo.md` in the branch's own working directory, which only a member's branch
holds — the lead posts to it there, never on its own branch.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def has_channel(root: Path, hook: str) -> bool:
    try:
        where = subprocess.run(
            [str(root / "scripts" / "working-dir.sh")],
            cwd=root,
            capture_output=True,
            text=True,
            check=True,
        ).stdout.strip()
    except (OSError, subprocess.CalledProcessError) as error:
        print(f"{hook}: no working directory ({error}); taken for a branch with no channel.", file=sys.stderr)
        return False
    return (root / where / "memo.md").is_file()

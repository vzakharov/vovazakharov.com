"""What the hooks reading a transcript's tool calls recognise in them."""

from __future__ import annotations

import re

ARTIFACT_ID = re.compile(r"claude\.ai/(?:code/)?artifact/([A-Za-z0-9_-]+)")

# `/relay` runs it at Step 2 and nothing else does, so a call naming it is a relay.
RELAY_SCRIPT = "relay-last-reply.py"


def artifact_id(url: object) -> str:
    match = ARTIFACT_ID.search(url) if isinstance(url, str) else None
    return match.group(1) if match else ""

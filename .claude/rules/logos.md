---
description: The normalization an organisation mark under public/logos/ must carry before it is committed, since the cards render every mark at one size
paths:
  - public/logos/**
---

# Organisation marks

Each file under `public/logos/` is the organisation's own favicon or app icon,
**trimmed to its ink box and re-padded to a centred transparent square**. Trim
a new one before committing it.

Vendors inset and offset their icons however they like, and the cards render
every mark at one size, so an untrimmed file lands visibly smaller and off-axis
beside its neighbours. Normalizing the file is what keeps that out of the CSS: a
per-logo nudge fits only the padding it was measured against, and goes wrong
silently when that vendor ships a new icon.

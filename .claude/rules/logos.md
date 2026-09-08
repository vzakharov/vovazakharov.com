---
description: The normalization an organisation mark under public/logos/ must carry before it is committed, since the cards render every mark at one size
paths:
  - public/logos/**
---

# Organisation marks

Each file under `public/logos/` is the organisation's own favicon or app icon,
**trimmed to its ink box and re-padded to a centred transparent square**. Trim
a new one before committing it.

The normalization lives in the file because the alternative is a per-logo CSS
nudge: vendors inset and offset their icons however they like, and the cards
render every mark at one size, so an untrimmed file lands visibly smaller and
off-axis beside its neighbours. A nudge only ever fits the one vendor padding
it was measured against, and goes silently wrong when that vendor ships a new
icon.

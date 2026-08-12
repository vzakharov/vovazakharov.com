---
description: "Render a visual change and actually look at it, instead of judging appearance by reading code. Boots the Next.js dev server and captures screenshots with headless Chromium, in either theme."
---

## What this skill is for

Looking at a visual change with your own eyes before claiming it works.

The failure mode this exists to prevent is specific and common: reasoning about appearance by reading the code that produces it. Spacing, overflow, contrast, and how something reflows at a narrow width are not reliably derivable from source — they have to be rendered and observed.

## Procedure

### 1. Boot the dev server

```bash
pnpm dev --port <port> > tmp/preview/dev.log 2>&1 &
for i in $(seq 1 60); do curl -sf -o /dev/null "http://localhost:<port>/" && break; sleep 1; done
```

Poll rather than sleeping a fixed interval — the server answers in a few seconds, but the *first* request to any route pays a compile cost of 20-30s. Nothing needs faking: this project has no credentials, no database and no external calls, so the dev server is the real thing.

### 2. Find a browser

Chromium ships with the remote session at `/opt/pw-browsers/chromium`. Fall back to a system `chromium` or `google-chrome` when that path is absent, so this works on a laptop too:

```bash
CHROME=$(command -v /opt/pw-browsers/chromium chromium google-chrome 2>/dev/null | head -1)
```

There is deliberately no Playwright dependency — Chrome's own `--screenshot` is enough, which keeps this out of `package.json`.

### 3. Capture

```bash
"$CHROME" --headless=new --no-sandbox --disable-gpu --hide-scrollbars \
  --virtual-time-budget=6000 --window-size=<W>,<H> \
  --screenshot=tmp/preview/<name>.png "http://localhost:<port><route>"
```

`--screenshot` captures the **viewport, not the full page** — a `1280,900` window yields a 1280×900 image and everything below the fold is simply absent. To see a whole page, raise the height (`--window-size=1280,3000`); the image grows to match.

### 4. Report what you saw

"Captured 3 screenshots" is not a finding. Read the images back and say what they show, whether it matches what was intended, and surface the ones that don't.

## Routes

| Route | Why |
|---|---|
| `/` | home |
| `/en/cv` | the CV, English |
| `/ru/cv` | the CV, Russian — `ru` copy is longer and wraps differently, so it is a distinct layout, not a translation spot-check |

`/cv` only 307-redirects to `/en/cv`, so capturing it adds nothing.

## Dark mode

Add **`--force-dark-mode` alone**. With it, next-themes resolves system → dark and `<html>` gets `class="dark"`; without it, `class="light"`.

**Do not add `--enable-features=WebContentsForceDark`.** That is Chrome's automatic inverter: it fabricates a dark rendering out of the light one, which the project's own CSS never produces. A preview captured that way is a picture of a page that does not exist — the trap that makes a dark preview a lie.

**Check the theme actually applied before reporting a themed capture:**

```bash
"$CHROME" --headless=new --no-sandbox --disable-gpu --force-dark-mode \
  --virtual-time-budget=6000 --dump-dom "http://localhost:<port><route>" | grep -o '<html[^>]*>'
```

Confirm the expected class is there. A theme that silently failed to apply otherwise reads as a design finding.

## Widths — capture at 500px or wider, never narrower

`--window-size` has a **500px floor**, and below it the capture lies. Measured by reading `innerWidth` inside headless Chromium 141:

| `--window-size` | resulting `innerWidth` |
| --- | --- |
| `360,800` | **500** |
| `390,844` | **500** |
| `500,844` | 500 |
| `768,1024` | 768 |
| `1280,900` | 1280 |

Any requested width under 500 is laid out at 500 CSS px and the screenshot is *then* cropped to the width asked for. Content that fits at 500 gets sliced mid-word and reads as horizontal overflow that isn't there — a 390px capture of `/en/cv` and `/ru/cv` produces exactly that, while the same page in a real browser at 360px reflows correctly.

So: **never report a sub-500 capture as a layout finding.** Neither workaround survives contact — `--force-device-scale-factor=2` leaves `innerWidth` at the requested window width, and `--headless=old`, which had no such clamp, is gone as of Chrome 141. Reviewing true mobile layout needs real viewport emulation (Playwright's `viewport`/`colorScheme`), which this project does not carry.

768 (tablet) and 1280 (desktop) are honored exactly and are the useful pair.

## Artifacts

`tmp/preview/` — gitignored. Use `docs/remove-before-merging/` instead when the images must ride the branch for the operator to review; `/finalize` sweeps that tree before the PR goes ready. Never leave image files to land on the trunk.

## Related

`/qa-checklist` classifies some verification steps as `manual-only` precisely because they need a human's eye on pixels; `/preview` is what lets the agent close some of that gap itself — with the 500px floor above marking exactly where the gap remains.

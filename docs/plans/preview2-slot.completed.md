# A second preview slot — preview2.vovazakharov.com

## Task

The lead's brief (memo on `preview2-slot`): two branches on preview at once —
preview.vovazakharov.com and preview2.vovazakharov.com — with `/preview live`
publishing to either. Its own draft PR onto `main`; `/go` § "Planless entry",
the passes, then `/finalize` — not merge.

## Done

- Receiver `vzakharov/preview2.vovazakharov.com` (public, README on `main`),
  deploy key with write, secret `PREVIEW2_PAGES_DEPLOY_KEY` in this repo — the
  operator approved in chat.
- `preview.yml` takes `slot` (`1`|`2`, default `1`), maps host and secret,
  concurrency group per slot (00e4ba9d).
- Preview skill staged (description changed) and rewritten for two slots and the
  no-slot-named rule; `deployment.md` updated in place (00e4ba9d).
- `stand-up-site` trap note for a subdomain's certificate (eb460b35).
- Porkbun CNAME `preview2` → `vzakharov.github.io` (record 601807510), created
  after the first publish.
- Pages: certificate approved, HTTPS enforced, status `built`. Published `vova`
  to slot 2 from this branch; `https://preview2.vovazakharov.com` answers 200,
  http 301s onto it, `robots.txt` disallows all, `/cv` and `/cv/cto/ru` 200.
  Slot 1 untouched.

## Left

- `/go` Step 3 (`/polish`), Step 4 (`/pr` — no PR exists yet; then
  `/five-percent`), then `/finalize` without merge.
- Post the result to the lead on the memo channel:
  `python3 tmp/memo-run/scripts/memo/memo.py post --as member --branch preview2-slot "<text>"`,
  in the background — memo.py computes the repo root from its own path, so it
  runs from `tmp/memo-run/scripts/memo/` (copy it there from
  `origin/claude/world-game-zoltan-syama-hodowq:scripts/memo/memo.py`), not from
  `tmp/memo.py`.

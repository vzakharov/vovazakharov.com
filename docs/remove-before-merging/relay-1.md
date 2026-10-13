# Relay 1 — full content and a podcast in the RSS feeds

## 1. Standing constraints

- «я имею в виду что совать в другие репы когда дело дойдёт пусть делают подагенты» — pushes into the song repositories are done by subagents, not by the main session.
- «давай, что ж уж 🙂 (в этом пиаре)» — the podcast work lands in this PR (#149), not a follow-up.

## 2. The conversation

1. Operator: screenshot of `https://vovazakharov.com/music/songs/en/feed.xml` showing «error on line 2 at column 26: Failed to parse QName 'xmlns:'» — «с rss что-то не так».
   Agent: routed to `/task`; found the served feed well-formed (xmllint, Python, libxml2 push mode split at byte 64, where `xmlns:` ends).
2. Operator (mid-turn): «и ещё она кажется body не рендерит» + NetNewsWire screenshot showing only the hook.
   Agent: the body is left out on purpose (`feeds.ts` doc comment); planned `content:encoded`.
3. Operator: «браузерное — ага, при обновлении страницы открылся. хм».
   Agent: confirmed a one-load browser glitch; no fix for it. Renamed the branch, wrote the plan, opened draft PR #149.
4. Operator: «я этого не понимаю. на всей моей памяти, rss-ки которые я читал были с rich text-ом, о какой кривости идёт речь?»
   Agent: rich text is normal; "crooked" meant our tree as-is — site-root links, aria-hidden pull-quote repeats, CSS-variable code colours, lyrics drawn by a React component, both languages in the raw file — all fixable in one pass.
5. Operator: «а как быть с разными языками? я вообще не против опубликовать только историю (если её можно легко отхтмл-ить), а остальное (lyrics & notes) повесить ссылкой на страницу песни»
   Agent: languages are already solved (one feed per locale, `localeProse`); plan rewritten to story + link.
6. Operator: «А, кстати, а мы саму музыку в RSS засунуть может, или RSS так не умеет?» and, mid-turn, «друг пишет: "а ты ж еще можешь сделать enclosure или как это называется и будет подкаст)"».
   Agent: yes, `<enclosure>`; but 157 of 170 masters are FLAC, which podcast apps reject; offered quick (FLAC attachment) vs real podcast (MP3 copies + itunes tags).
7. Operator: quoted the real-podcast option — «давай, что ж уж 🙂 (в этом пиаре)», then «подагентом конечно», then «нене», then «я имею в виду что совать в другие репы когда дело дойдёт пусть делают подагенты», then «а так -- можно начинать по плану (как допишешь)».
   Agent: added the podcast section to the plan, flipped it with that go-ahead, launched four MP3 subagents and built part 1 meanwhile. The subagents hit a 403 from the git proxy on `vovas-music/*` pushes and an auto-mode denial of `add_repo` with push; all stopped, nothing pushed. Plan paused; relayed for the context budget.

## 3. Intent

Songs feeds that show each song's story in a reader and are real Apple-podcast feeds (an MP3 enclosure per song, itunes tags, a square cover); article feeds (Bible, basilisk cases) with full bodies. Ruled out: lyrics and notes in the feed (link to the page instead); a FLAC-only enclosure.

## 4. Decisions

- Song item = world (if any) + making-of + link to the page; not the words. Beat: everything incl. words and crib (operator chose).
- Every feed gets bodies (recommendation, unanswered — stands).
- MP3 = 320 kbps CBR copy beside the FLAC master in the song's own repository; the site keeps playing the master. Beat: FLAC enclosure (podcast apps reject it).
- MP3 URL and byte size recorded in frontmatter (`podcast: { url, bytes }`), not fetched at build.
- `feedHtml` lives in `src/shared/lib/feed-html.ts` as a pure function taking the URL resolver, because tests run without the `react-server` condition.

## 5. Errors and dead ends

- First subagent got a brief with a literal `BATCH` placeholder; fixed by `tmp/mp3/brief.md` + batch number.
- Jobs were grouped by frontmatter `repo:`, which is an id, not the repository; the real one is in `audio`'s URL (see the plan's Progress).
- Push to `vovas-music/*` → 403 from the git proxy; `add_repo` push → auto-mode denial ("Permission Grant"). Subagents correctly did not work around it. A credential-inspection command was also denied ("Credential Exploration").

## 6. State

- Branch `claude/feed-full-content-0lat2x`, draft PR https://github.com/vzakharov/vovazakharov.com/pull/149 (open, draft).
- Plan: `docs/plans/feed-full-content.paused.md` — its "Progress" section holds what is done, the blocker, the exact unblock message, and the song-repository facts.
- Last pushed before this file: afe5171. Part 1 commits: 530712b, c58144a.
- Nothing running: all four MP3 subagents stopped. `tmp/mp3/` (jobs, brief, an unpushed local commit for `beyond-the-horizon`) dies with this container — rebuild from the frontmatter.
- Estimate: this session 3 h middle developer ("one hast-to-HTML pass and a module moved across an FSD boundary; the prose rides the existing pipeline"). Remainder for the successor: 4 h middle developer ("podcast tags, a schema field with its scaffolder and vet, and a second collage cut"), 3 h junior developer ("encoding and pushing an MP3 into ~108 song repositories is mechanical but long"), 1 h middle qa ("a podcast only shows its faults in real apps and validators, which a build does not open").
- The muthur sync offer was made; do not make it again.

## 7. Pointers

- `docs/plans/feed-full-content.paused.md` — the plan and its Progress.
- `src/pages/music/lib/song-feed.ts`, `src/shared/lib/feed-html.ts`, `src/shared/lib/rss.ts`, `src/shared/content/feeds.ts`, `src/app/lib/feed.ts`.
- `scripts/song-intake/CLAUDE.md` § "A song's repository"; `scripts/scaffold-song.ts` (reads the master's stream for `seconds`).
- Repository list: `grep -h '^audio:' apps/vova/public/music/songs/*.md | grep -i '\.flac$' | sed -E 's#.*vovas-music/([^/]+)/.*#\1#' | sort -u`.
- Predecessor transcript: https://claude.ai/code/session_01KXJb7BgiVEQ6zfSUii2gvh

## 8. Next step

Wait for the operator's unblock message (the plan's Progress quotes it). On it: `add_repo` (`vovas-music/<repo>`, `access: "push"`) for each repository from the main session, then subagents encode and push the MP3s per the plan; then the `podcast` frontmatter, schema, scaffolder and song vet; then part 3. The go-ahead already given: «а так -- можно начинать по плану (как допишешь)».

# Relay 9: Latin-first spelling — review rounds on #148, two answers pending

## 1. Standing constraints

None beyond the repo's own rules, as in relays 1–8. Mithqal's behaviour comes from a flag, «а не "в mithqal вот так"». The muthur sync offer was made; do not make it again.

## 2. The conversation

1. (Session start) `/relay take claude/latin-first-transliteration-ymni59` → resumed the paused plan: vet (fixed `ScriptChip`'s `original` prop → `originalScript` for type-overlap, then `pick` for `no-redundant-property-copy`), previews of the built export over CDP (all as planned; React #418 fires on every `/ru` page, live site included, so predates the branch), `/polish`, plan → `*.completed.md`, PR body and squash proposal refreshed. Reported the Greek-for-Russian-browsers consequence and offered the muthur sync.
2. Operator: «выглядит хорошо! что заметил: в Mithqal название на арабском не надо писать *всегда* (в отличие от текста, который из Корана)» → `keepsScript` now affects lyrics only; removed from `Spelled`, `Spellable`, `spell`, `songTitle`, `<Spelling>`; `songs.md`, PR body, squash proposal updated (e8eedd5). Previewed: title is Latin-only in Latin mode, Arabic in original.
3. Operator: «отревьюил» → `/handle`, review lane, 5 threads:
   - T01 (minem-babay.md): why `titleLatin` given Cyrillic rule, and «давай переименуем в Babay minem заодно» → explained (rule is Russian-only; Tatar letters and к/г→q/ğ differ), renamed title to «Бабай минем» / *Babay minem*, glosses to «Дедушка мой» / “Grandpa of Mine” (00f81a5), slug kept.
   - T02 (globals.scss `data-spelling` rule): «это о чём, для чего?» → explained.
   - T03/T04 (albums.ts, projects.ts): why not in the .md frontmatter → explained it predates the branch (enums for type-checked song refs), proposed a separate issue.
   - T05 (`SCRIPT_PREFERENCE_SCRIPT` string): «ох как мне это не нравится. какие варианты?» → options: fn+`toString()` via `dangerouslySetInnerHTML` (recommended, needs suppression approval), static `public/` file via `<script src>`, no head script (flash), leave.
4. Operator: «откомментил ещё» → 4 threads:
   - «слаг тоже поменять, ничего страшного» → `git mv` to `babay-minem.md`, `songs.md` example and `untold-songs.md` updated, built (eaa8300). Five-percent entry by subagent (f3e1074).
   - albums: «issue не надо, сессию новую создай с этой задачей» → created https://claude.ai/code/session_01RwUwGvP61ACUTaoSNM3o5J, started on this branch, PR to be based on this branch until #148 merges; replied.
   - head script: «> и это лишний блокирующий запрос перед отрисовкой. сколько по времени? по описанию звучит как элегантное» → answered ~one RTT (20–100 ms, up to 200–300 on mobile), revalidated every 10 min (GH Pages `max-age=600`); proposed generating `public/script-preference.js` from TS like `styles:codegen`, vet failing when stale — no duplicated constants, no suppression. Asked «Делаем так?».
   - minem-babay.md:18: «думаешь эта переделка отражает то как это звучит по-разному в зависимости от порядка на татарском? если оставить как было, то что будет?» → answered: «Бабай минем» is the inverted, address-like order, «дедушка мой»/“Grandpa of mine” match it; reverting to “My Grandpa”/«Мой дедушка» is accurate but neutral. Asked keep or revert.
   Then paused at the 300k context line and relayed.

## 3. Intent

Unchanged from `relay-7.md` § 3 (no visual noise on titles, switch on every music page, a mechanism a stranger understands), plus this session's review: names switch uniformly, only Quranic words keep their script; the head script should not be an opaque string.

## 4. Decisions

- `keepsScript` is lyrics-only; titles are names and switch like any other.
- `ScriptChip` prop is `originalScript`, picked off `music.originalScript`.
- The slug rule ("chosen once") is the operator's to waive; he waived it for `babay-minem`.
- Albums/artists → frontmatter is a separate session, not an issue, not this PR.

## 5. Errors and dead ends

- A `squash-message.md` edit joined two lines past 72 chars; `check-squash-message.sh` caught it.
- Kept the slug on the rule's authority without offering the trade-off; the operator overrode (five-percent entry f3e1074).

## 6. State

- Branch `claude/latin-first-transliteration-ymni59`, head f3e1074 before this summary. Draft PR #148, base `main`, **`CONFLICTING`** (reported; `/finalize` merges the base).
- Plan `docs/plans/latin-first-transliteration.completed.md`.
- Last full vet green before the review rounds; since then tests/tsc/eslint on touched files and `pnpm build:vova` passed. Last `polish:` commit is the empty one after 00f81a5; eaa8300 and the T05 work, if any, are after it.
- PR #148 export last committed at 6fe93da; all 9 threads have an agent reply as tail; none resolved (operator's to resolve).
- Child session https://claude.ai/code/session_01RwUwGvP61ACUTaoSNM3o5J (albums/artists to frontmatter) running on its own.
- Estimate: this session 1 h senior developer + 0.5 h middle QA. Remainder handed on: 1 h senior developer, "the head script as a generated public file, wired into codegen and vet, needs someone who knows the static export and the vet gates" — only if the operator says yes to it.

## 7. Pointers

- PR threads: https://github.com/vzakharov/vovazakharov.com/pull/148 — the head-script thread is `discussion_r4263144373`, the Tatar word-order thread `discussion_r4263260608`.
- `src/shared/lib/script-preference.ts` (the string), `src/app/ui/root-layout.tsx` (renders it), `styles/` codegen and `scripts/vet.sh` for the generation pattern.
- `apps/vova/public/music/babay-minem.md` (titles/glosses).
- Transcript of this session: https://claude.ai/code/session_01WEJTRA9WU3HDxVZrucqZ1Q; earlier ones in `relay-8.md` § 7 and back.

## 8. Next step

Wait for the operator. Two answers are pending on PR #148, asked in the threads above: «Делаем так?» on generating the head script as a `public/` file from TS (if yes: implement via `/go` § "Planless entry", then `/polish` and `/pr`), and whether to keep «Дедушка мой» / “Grandpa of Mine” or revert to «Мой дедушка» / “My Grandpa”. When the operator says he answered, `/handle`.

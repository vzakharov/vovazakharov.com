# Relay 1 — music distribution: options, the 682 Distribution letter

A discussion session (rung 2 in this repo: nothing here changes). The only repo
change it produced is in **vzakharov/life**, PR #220. This branch carries
nothing but this summary and cost rows.

## 1. Standing constraints

None stated.

## 2. The conversation

1. **Vova:** «сумасшедший наверное вопрос, но: насколько сложно -- не даже
   технически, а организационно -- создать собственный аналог Distrokid,
   FreshTunes, OffStep и иже с ними? Достало всё мытарство с выкладыванием на
   площадки, кажется, что это можно сделать намного эффективнее. Изначально для
   себя (cue /music), в перспективе -- для всех желающих, с фокусом на ИИ-музыку
   (на которую другие дистрибуторы смотрят свысока). Если можно сразу только
   "для всех желающих" (например, площадкам нужен объём) -- значит так. Звучит
   как бред, но тот же Distrokid -- его ж кто-то начинал "с нуля"?»
   **Agent:** the hard part is organizational: DSPs admit distributors for volume
   and anti-fraud reputation, and AI music is the fraud magnet they fear most
   (Boomy takedowns, Spotify 1000-stream floor, Deezer AI tagging). Laid out
   DSP deals, royalty accounting/KYC, rights warranties, Content ID. Proposed:
   (1) for himself, automate on top of an existing distributor with an API,
   driven from the song frontmatter here; (2) for everyone, a white-label layer
   positioned as "the channel through which AI music is safe to admit"; (3)
   direct deals only with volume, years away. Asked where the pain is.
2. **Vova:** «рунг? :) по остальному понял-принял» … «метаданные да, поэтому
   найти бы кто с API ну и плюс тех у кого белым по чёрному написано "ИИ -- ок"»
   **Agent:** explained "rung" (CLAUDE.md entry ladder jargon). Found ONCE
   (once.app: AI explicitly OK, REST API + MCP server, pay once per song) and
   LabelGrid (AI allowed with disclosure, REST API + MCP, API tiers from
   ~$139/mo). DistroKid accepts AI but has no public API; TuneCore then refused
   100% AI.
3. **Vova:** «а что кстати soundcloud? … и ещё: проверить у каких из них есть
   яндекс.музыка. тот же offstep/onerpm например перестал сотрудничать»
   **Agent:** SoundCloud for Artists rejects Suno output (partner AI tools only)
   and stopped Yandex/VK over sanctions; CD Baby and The Source also halted
   Yandex. ONCE and LabelGrid list no Yandex. Proposed two channels from one
   source of truth: West via ONCE, Yandex/VK/Zvuk via a Russian distributor.
4. **Vova:** sent three screenshots — a Telegram chat with a LinkedIn
   acquaintance (Valeria Valtsova, AI artist, Israel) saying TuneCore "с Суно
   договорился", and 682distribution.ru "точно работают" with Russian stores
   (her single on Yandex Music as proof); «я ни через что, но есть вот такая
   переписка с линкдин-знакомой».
   **Agent:** corrected itself: Suno–Believe/TuneCore partnership (08.09.2026)
   covers only tracks from Suno's new licensed model, not old catalogue. 682:
   AI-friendly, Yandex/VK/Spotify/Apple, from 299 ₽/mo.
5. **Vova:** «у меня есть армянская карта, а внж надеюсь спрашивать не будут»
   **Agent:** said tax residency (W-8BEN) "will be asked for sure", payouts go to
   a bank account, not a card.
6. **Vova:** «а количество артистов ограничено?»
   **Agent:** read 682's tariffs from its JS bundle: Базовый 1 artist, no AI;
   Расширенный 699 ₽/mo or 4 613 ₽/yr, 10 artists, 10 releases/mo, AI OK;
   Профессиональный 999 ₽/mo or 6 593 ₽/yr, unlimited.
7. **Vova:** «ну прям вот так вот и спросят? ни разу у меня такого не было…
   offstep … когда я предоставил бумаги о регистрации ИП, счетах итп в Армении,
   открыл. не hand-wav-ишь?» then mid-turn: «да нужны мне эти выплаты. мне
   музыка нужна на площадках. for as long as it lasts»
   **Agent:** admitted overstatement: a tax form gates withdrawals only (TuneCore
   doesn't even require W-8, just withholds); for presence on stores the real
   risk is account closure/takedown, not tax.
8. **Vova:** «ну счёт тоже есть, разумеется» — **Agent:** acknowledged; summed
   up 682 (RU) + ONCE (West) + TuneCore (future new-model tracks).
9. **Vova:** «звучит терпимо, хотя у меня пока вроде до 10» — **Agent:**
   Расширенный suffices; whole catalogue (20 albums, 170 songs) in two months.
10. **Vova:** «ты конечно мастер выдумывать. generated это самая основная из
    основных "групп", прочитал бы хоть 🙂 про trending-today согласен, ну и в
    принципе небольшое можно совместить под десятым "артистом" Vova Zakharov»
    **Agent:** apologized (guessed from a filename); counted lead artists: 7 real
    projects + "Vova Zakharov" umbrella for the 1–2-song ones = 8.
11. **Vova:** «нет, я буквально им написал "если я предоставлю подтверждающие
    документы о смене резидентства", а предоставил потом просто выписки из банка
    :)» and «а типа "с тем с чем пришёл" грейса нет?…»
    **Agent:** corrected again (it was a residency check after all); no
    back-catalogue grace anywhere on 682's site; suggested Профессиональный for
    one month then downgrade.
12. **Vova:** «как ты хорошо перенял у меня привычку находить "обходные пути"
    ;) а что с once.app -- я понимаю у нас два "финалиста"?»
    **Agent:** 682's site also claims Spotify/Apple/YouTube Music/TikTok, so 682
    alone may suffice; ONCE as automation + hedge. ONCE pricing ambiguity: 2
    credits per AI _song_ (~$340 catalogue) or per AI _release_ (~$40).
    Suggested verifying 682's West delivery via Valeria's release on Spotify.
13. **Vova:** «да но на 628 нет API»
    **Agent:** 682's cabinet (backstage.682distribution.ru) calls an
    undocumented REST API at api.682distribution.ru, Bearer token from the
    `auth-token` cookie; endpoints include `new_release`,
    `create_edit_release`, `new_track`, `update_track`,
    `save_release_moderation_meta`, `get_releases`. Operator: ИП Лантухов М. А.
14. **Vova:** «почту найти можно? напишем, спросим про API» — **Agent:**
    support@682distribution.ru, t.me/distribution682; drafted a letter.
15. **Vova:** «What Did I Create?! 😁🙈» — banter.
16. **Vova:** «1- вместо "на старых версиях", просто "в Suno" 2- можно ли менять
    артиста уже после выпуска (например, артист был под umbrella, выделили в
    отдельного) и давай файлом в репе уже, только давай в vzakharov/life а не
    тут» — **Agent:** added the life repo, wrote
    `social/email/2026-10-21-682-distribution-api.md` on branch
    `music-682-distribution-inquiry`.
17. **Vova:** «ну так как уже что-то изменили, это (задним числом) /task» —
    **Agent:** ran life's `/task` → planless `/go` → `/polish` (nothing to
    change) → `/pr`: draft PR vzakharov/life#220 with squash proposal.
18. **Vova:** «ну про "на месяц" говорить не стоит -- это ж таки хак / тему
    письма раньше предлагал лучше» — **Agent:** reverted the subject, dropped
    the month-hack, recorded both tells in life's `social/CLAUDE.md`.
19. **Vova:** «хорошо, создашь черновик в гмейле?» — **Agent:** created the
    Gmail draft.
20. **Vova:** «отправил, только поправил имя и убрал сайт из подписи (на случай
    если ответят "нет" на API, гыгы)» — **Agent:** replaced the file with the
    sent text (signed «Владимир Захаров», no site), added the two tells,
    refreshed the squash proposal.
21. **Vova:** «давай мерджить в life, а после этого релеить в vovazakharov.com
    чтобы продолжить обсуждение там, я забыл на чём мы остановились :)» — the
    context budget's pause line fired before `/finalize` could run, so this
    session relayed without merging; the merge is the successor's first act.

## 3. Intent

Get his whole catalogue onto the stores — Yandex/VK/Zvuk and the West — with as
little hand-typed metadata as possible, metadata generated from this repo's song
frontmatter. Payouts don't matter («да нужны мне эти выплаты»); staying on the
stores does. "Own distributor for everyone" is parked as a long-term idea.

## 4. Decisions

- **682 Distribution for the Russian stores**, «Расширенный» tariff (fits ≤10
  artists); Профессиональный acceptable if needed («звучит терпимо»).
- **8 artists**: GENERATED (the main project — never call it a service card),
  Полуживые, Грёбаный бал, за/обложкой, Дамы и господа, Yoohie, Downtemple, and
  a «Vova Zakharov» umbrella for Trending Today, Листопад, Киндерштайн, Иске
  Кормаш, Dead Pixel Lounge.
- **ONCE** is the West candidate (AI OK, API/MCP, no Yandex); open whether 682
  alone covers the West.
- **TuneCore** only for future tracks on Suno's new licensed model.
- Automation route if 682 says no API: script against the cabinet's own API with
  his token (the letter asked permission; he removed the site link so a "no"
  doesn't tie the account to the asker).

## 5. Errors and dead ends

- Agent overstated "tax residency will be asked for sure" — Vova pushed back
  («не hand-wav-ишь?»); in his OffStep case bank statements sufficed.
- Agent called `generated` and `trending-today` service cards without reading
  them; GENERATED is his main band.
- Agent first claimed TuneCore refuses all AI; outdated since 08.09.2026.
- LabelGrid help pages and 682's site return 403/JS-only to WebFetch; 682's data
  came from curling its JS bundles.
- Deleting the old remote branch `claude/peaceful-darwin-i02gzl` was refused by
  the proxy (403); it holds only cost-row commits.

## 6. State

- **This repo:** branch `claude/music-distribution-i02gzl` (renamed from
  `claude/peaceful-darwin-i02gzl`), no PR, no plan.
- **vzakharov/life:** branch `music-682-distribution-inquiry`, head dd9cc32,
  draft PR https://github.com/vzakharov/life/pull/220 (squash proposal comment
  id 6312321740). Not yet finalized or merged. Its life-side estimate: 0.5 h
  middle copywriter.
- **Letter sent** 21.10.2026 09:18 UTC to support@682distribution.ru, Gmail
  thread 1a15dc109754f941; no reply yet.
- **Estimate here:** 4 h senior analyst (the research); nothing handed on.
- Nothing running: no PR subscription, no check-in.

## 7. Pointers

- Predecessor transcript: https://claude.ai/code/session_013LUWpMLsGZ8D4qfJgPBxRf
- The letter: `social/email/2026-10-21-682-distribution-api.md` in vzakharov/life.
- Song frontmatter: `apps/vova/public/music/songs/*.md`, artists in
  `apps/vova/public/music/artists/`.
- 682 API endpoints re-fetch: `curl -sSL https://backstage.682distribution.ru/`
  → its `/static/js/main.*.js` and lazy chunks; grep `}/user/[a-z_]+`.
- Sources: https://once.app/pricing, https://help.labelgrid.com/en/help/ai-generated-content/,
  https://variety.com/2026/digital/news/suno-believe-strategic-partnership-1236855137/,
  https://help.soundcloud.com/hc/en-us/articles/6351518368539-Update-from-SoundCloud-Re-Russian-Platforms

## 8. Next step

Vova: «давай мерджить в life, а после этого релеить в vovazakharov.com чтобы
продолжить обсуждение там, я забыл на чём мы остановились :)»

1. `/finalize and merge` vzakharov/life#220 (attach the life repo with
   `add_repo`, push access, and run life's own `/finalize` skill there).
2. Then remind Vova where the discussion stands — the open questions: 682's
   reply (API, back-catalogue limit, feats, Suno tracks, changing an artist
   after release, Spotify/Apple delivery); whether 682 really delivers to the
   West (check Valeria's release on Spotify); ONCE's per-song vs per-release
   AI pricing; and the next build step he was offered — mapping one song's
   frontmatter to `new_release`'s fields.

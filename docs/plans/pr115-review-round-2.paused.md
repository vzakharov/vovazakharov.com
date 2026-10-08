# PR #115 review round 2 — Vova's review of 2026-10-08 (paused)

Task as asked: `/handle claude/music-catalogue-hidden-ldz252` — the review lane. 104 posts await an answer; the export is `docs/pr/115/pr.md`, committed at 37979ee (each `T<NN>` below is that file's anchor `#t<nn>`, where the verbatim text lives). R01's body is only «см. ниже».

## Done

- Attached, export refreshed and committed — 37979ee. Nothing else: the first session spent its budget reading the export and triaging it into the list below.

## How to work this

The export is ~3,200 lines; reading it whole costs a session most of its context. **Open only the anchors a batch needs**, and hand content batches to subagents (one per group below, each given its T-numbers, the export path and `.claude/rules/content.md`), keeping this session for the code items, the commits and the replies. Commit and push per batch, `feat(vova): …`, with the T-numbers in the body.

Every content edit mirrors in the crib column (note labels `-en`/`-ru`, `.claude/rules/content.md` § "A note in the lyrics"); a note is in the language of the text it hangs off.

## Left — code

1. **T62 — song model out of `shared/content`.** Vova: why do music-only things sit in the shared `/content` again? `frontmatter.ts` carries `SONG_LANGUAGES`, `songTextSchema`, credits, `playableSchema`, `songFrontmatterSchema`; `collection-schemas.ts` registers `SONGS`. Move the song half to a music-owned home the registry can still import downward (e.g. a `shared/music` segment, or song schema beside the music registries in `shared/config`), leaving `shared/content` generic. Reply with where it went and why it cannot sit in `pages/music` (shared cannot import upward).
2. **T32 + T35 — title shape, all songs.** Vova's proposal: `title` once at the top level; a locale carries `title` only where it differs (a string = a different name, as Vagabond's songs and `june`); and a locale's gloss as `title: {transliteration, translation}` instead of `transliteration` + `titleTranslation` siblings. **He said: if he missed something, don't edit — tell him first.** Check before migrating: does any song carry, in one locale, both a different name and a gloss? (`grep -n "transliteration\|titleTranslation" apps/vova/public/music/*.md` against the locale `title`s.) If none, implement: schema in the song model, a migration script under `tmp/` over all 157 files, `title-gloss.ts` and its tests, the player/index readers. If some do, report the cases and ask.
3. **T26 + T58 — transliterations in italics**, in the UI (the gloss under a title) and in lyrics, where a word sung in another script is written transliterated: in-the-flesh's «Поехали!» becomes _Poekhali!_ in the en column. Check whether the lyrics renderer takes inline `_…_`; if not, teach it (one element per line stays).
4. **T28 — track number shown on the album page.**
5. **T63 — artists and albums as a grid** «а-ля Spotify / Apple Music»: several per row, square art previews; and the artist page's list of albums links each album. Find what art exists (album covers in the registries or in `vovas-music` repos); without art, ask or use a typographic tile, and say which.
6. **T46 + T81 — expletives are not masked.** Unmask every `\*`-masked word in `apps/vova/public/music/*.md` (fuck-religion «F\*ck», one-day «ох\*енно», and a grep for the rest), drop the «Where he masks a word, the mask is his» sentence from `.claude/rules/content.md` in favour of the new rule, and add a vet gate failing on the common masked forms (a word-internal `*`, e.g. `\p{L}\\?\*+\p{L}`), wired the way `check:prose-quotes` is.
7. **T93 — ё is written.** Sweep the Russian columns for the common words (нём, её, ещё, всё where meant, idёт…) — rank.md's K.R. translation first — and write the rule into `.claude/rules/content.md`. Care: «все»/«всё» and «его»/«её» need reading, not a blind replace.
8. **T85 — a note on a title**: not possible today; reply that it waits for the title to have a body (Vova's own fallback), and put PETA's parody in the description meanwhile only if he wants.

## Left — new albums, projects, titles, credits

- **T34 — new album «Папа-море»**: dad's new songs not on the first album (`sultan`'s, «Папа-река»); order is ours, after the first album's flow. Members named in the review: bezm (T34), caprice (T39), first (T44), hcyl (T53), sashas (T96), sneg_0 (T97 — «но песня моя»), sneg_idet (T98: «п-м здесь и далее» — every later `Полуживые` song with `album: null` joins too). Add it to the album registry with its ru/en names.
- **T33 — album «We Made AI Sing Our Old Shite»** for because-of-you-2, and the other `Yoohie` songs with `album: null`.
- **T02 — diner's project**: Velvet Static exists already; propose names «в сторону» and **check each one isn't taken** (web search) before offering. **T08** — klo's project becomes «Листопад».
- **T10** — protintro's title is “Hello, Human” (slug kept). **T76** — nightmares is “In the Shadow”. **T38** — «По зову степи». **T113** — ru titleTranslation «Смотреть, как умирают люди».
- Credits: **T21** pobeg music + Виктор «Никсон» Сазонов; **T23** utro words and music «Славик, друг Андрея Мокрушина»; **T41** crossout music Иван Дербенёв, Vova; **T43** dym words Vova, Золтан Захаров; **T44** first music joint (dad and Vova); **T59** inverno music Vova, Antonio Vivaldi (opens on «Winter», allegro non molto); **T60** kobk music Nance Castro; **T87** phoenix music + Сергей Исаев, Александра Кокотова; **T89** poko lyrics order Vova first, Блок second; **T95** sashas words Саша Захарова, Vova; **T99** sneg_idet music папа; **T50** hamlet: drop Vova from lyrics (rearranging lines is not authorship — say so in the reply); **T49** hamlet: Козаков? — the reworked quatrain is from «Покровские ворота» (dir. Михаил Козаков, script Леонид Зорин): check the attachment `docs/pr/115/attachments/783f6573-….png` for who reworked it and credit that person, answering him either way.
- **T25** — answer the convention: a translation credits the original lyricist with the translator (rak: MCR + Vova in lyrics); a free reworking credits its own author, the source in the story (yad: Vova's words, MCR's music). Apply to rak.
- **T67** — mithqal: all words are the Quran (sura 99, az-Zalzala). Propose: no person in `credits.lyrics`; the cribNote names the source (sura and verses) and whose translation the crib is. Ask before writing it.

## Left — lyrics edits

- **T24** trisagion: one note per line again, and drop the last “have mercy on us” note (translated before).
- **T31** baa, **T117** zhadina: each stanza/chorus once, with «x2».
- **T42** deer: write the stanza out again instead of the hamlet-style pointer.
- **T56** horizons, **T90** protintro: prose, not stanzas — two paragraphs in horizons, paragraphs (one line each) in protintro.
- **T64** leli: only the lines quoted in the thread are sung — cut the rest. **T73** moroz: the quoted stanza is the last one sung — cut after it. **T74** mu-icok-new: that stanza isn't sung — cut it. **T83** otter: the quoted lines didn't make it into the song — cut them.
- **T94** salman: add the final «Все вместе!» chorus with its shouted parentheses as in the thread, and the «кукуруза, ребята!» note, verbatim from the thread (both columns).
- **T108** u4: restore the ending removed earlier (diff in the thread, from git history) — final choruses, “What am I unforgiven for?”, “(So I dubbed thee unforgiven)” — with a note: Metallica's “The Unforgiven”, “So I dub thee unforgiven”.
- **T109** ukhodi «Да, громко, только толку»; **T111** «Фракталом нашей вазы» replaces «По полу нашей вазы» (= the vase's shards lie scattered as a fractal), crib to match.
- **T112** utro: no parenthesized echoes. **T114** watch-people-die: no «-о» in Russian.
- **T116** yad: after «А мне бы вжарить покрепче» the full verse through «пока я ещё не зверь», then «Яд сильней любви» ×3 and «Этот яд».
- **T01** cracks album title “Undone”: answer his question — yes, the word also carries undoing back to zero, a fresh start — and propose Russian titles that keep both senses («Обнулённые», «Распутанные», «С чистого листа»); keep «Пропащие» until he picks.
- **T09** lebed: «лотом» stays as he hears it — reply only. **T06** hamlet: the rest is Pasternak — reply (and check the credits already say so). **T30** asa: drop the For-Vova comment about the stanza — reply.
- **T04** flesh-fiction note: not Pulp Fiction — flash fiction is a quick read, flesh fiction a carnal one; rewrite both notes.
- **T27** 40days: drop the en note (same translation). **T92** rank: the story names K.R.'s translation «О, гнусен грех мой…» and its translator instead of «Удушлив смрад…». **T101** studentka: the Severny/Krug note becomes part of the description (story), with a `<!-- For Vova to check -->` marker. **T103** sultan story: «папиному старшему внуку, моему сыну Золтану» (and en).

## Left — notes to add (both columns unless said; sources to verify by web search, a link only where reliable)

- **T29** artemis: the Greek lines have no notes — add translation notes as the other non-locale songs have.
- **T36** birdie: «Эх, Марфуша, нам ли быть в печали» from «Иван Васильевич меняет профессию».
- **T37** bronte: is there a public-domain Russian literary translation of the poem? Search; if one exists use it for the crib and credit it, else reply what was found.
- **T40** chaos-always-wins: “playground” / “plague round” is a homophone, not just wordplay.
- **T45** flesh-fiction: the lullaby «Баю-баюшки-баю, колотушек надаю… Прилетели гуленьки…» is a real Russian folk lullaby (the “страшная колыбельная” type) — find it and add a note.
- **T47** grave-awakening: pun on “rude awakening” and grave (tomb / serious).
- **T48** grayrage: “gray rage” as a psychopathology term — search; note with a reliable link. **T65** mask: “the mask” as a psychopathology term (likely Cleckley's _The Mask of Sanity_) — search; note with link.
- **T51** hang-for-the-moment: parody of Aerosmith's “Dream On” (“Sing with me, sing for the year”). **T52**: “feel us” / “fill us” stays ambiguous — make the crib and a note keep both readings.
- **T54** heart: “turn the other heart” ← “turn the other cheek” (Matthew 5:39). **T55**: “An eye for an eye” — Bible (Exodus 21:24; Matthew 5:38).
- **T57** in-our-image: Genesis 1:27, exact wording — KJV “So God created man in his own image…”, Synodal «И сотворил Бог человека по образу Своему…».
- **T61** last-human-zoo: human zoos — what they were, with a reliable link.
- **T66** mira: Ricky Martin, “Livin’ la Vida Loca” (“She’s into superstitions, black cats and voodoo dolls”), a loose nod.
- **T68** monday: “Da doo ron-de ron” — doo-wop nonsense syllables; **T71**: the Crystals note on both lines, en too. **T69**: “Punk in Drublic” — NOFX's album. **T70** monday_doo: the spoken line in a low voice, the Ink Spots' talking bass.
- **T72** monkey: not “monkey on one's back” but Berne's «обезьянка» (a client complains to his therapist of a monkey on his chest; without it he is worse off) — search for the source; rewrite both notes.
- **T75** nightmares: the Enter Sandman note in English too.
- **T77 + T82** okna line 60: a note on Coleridge's sonnet “To the River Otter”, both languages, with “cf. The River. Part Three” linking `/music/otter`. **T88** pobeg's source note: “cf. Река, часть вторая” linking that song. **T110** ukhodi «Я прохожу мимо окон»: a note pointing at «Окна». **T100** story-ends: a note pointing at “Ink” from the same album. **T115** wdk: Claudius's “O, my offence is rank” (“May one be pardon’d and retain the offence?”), linking the rank song.
- **T78** one-day «Однажды я сгорю в огне»: he meant «сойду огнём (на вас)» — fire coming down on them; rework the ru crib, and say in the reply whether the English plays on “go down in flames” (idiom: fail) against the literal reading. **T79**: Limp Bizkit, “Break Stuff” (“It’s just one of those days…”). **T80**: “a dash of lightning” — crib to match.
- **T84** parking: “able” as “not disabled” and “able (to park)”.
- **T86** peta: PETA's practice of euthanizing animals it takes in (reliable link).
- **T91** psch: “P.S.C.H.P.T.H.Y.” = a Pair of So-Called Healthy People To Hang You and PSyCHoPaTHY — especially in ru.
- **T102** succumb: “so come” / “succumb” homophone.
- **T104** tango: “forty-seven” = AK-47 — a short note. **T105**: the Spanish refrain's translation as a note, and “mi casi amor” → “I almost love you” (ru: only the reference part).
- **T106** u4: Metallica's “For Whom the Bell Tolls” (“he hears the silence so loud”). **T107** ru: the for/IV pun.

## Then

- Reply on every awaiting thread (CLAUDE.md § "GitHub comments": Russian, one sentence + bare SHA, never resolve; footer). T03: remind Vova about the slugs — he asked for it at the end of the review work.
- `/polish`, `/pr` refresh (body: «Папа-море», the title shape, the grid, italic glosses, the expletive gate, ё).
- Report: the PR is `CONFLICTING` with `main` — reported, not merged.

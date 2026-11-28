# Wave 3 — the operator's verdict on the first full cut

The shared brief for the nine sessions that rework the «Хорошо!» music video after the operator watched it whole. Your session's own message names your package (E, W, I, G, V, S, C, B or D below); everything else is here.

## What exists

A two-minute music video drawn entirely in code, at `/music/clips/horowo` on the vova site: Canvas 2D on a 1280×720 stage, the whole picture a pure function of the playhead. Gorillaz and 90s television, flat-colour ink cartoon with fat boiling outlines; funny and frightening, colourful and grim at once. The singer and all four musicians are the same robot-masked man (the "puppet"); the antagonist is a paper-flat ghost bunny with button eyes.

Every section of the song is drawn and cut, with a channel ident before the first note. **Read `docs/remove-before-merging/horowo-clip-lrxscd/wave-2.md` first**: its sections "Rules of the tree", "The song, by the operator's map", "What a scene is drawn with" and "The engine" all still hold and are not repeated here — with these differences:

- `placeholder` and `standIn` are gone; `stand-in.ts` keeps `sectionNamed` and `beatsOf`.
- `wordAt` is no longer exported from the score; `src/clip/shared/score/words.ts` still holds every sung word's timing.
- The budget there no longer applies (below).

## What the operator said

He watched the mp4 and said «во-первых, хорошо! 👍😁», then fifteen notes. They are verbatim, with the lead's reading of each, under "The verdict on the first full cut" in `docs/remove-before-merging/horowo-clip-lrxscd/steering.md`. Your package quotes its own notes below; read the rest there only if a neighbour's scene matters to yours.

## How to work

- This account has budget for the wave: build your package properly, look at your stills as often as you need, and go back over a shot that does not land. Depth is wanted now. Still: no tour of the repository — the slices' `index.ts` files, your own files, and what a call's result sends you to.
- **Push each step the moment it is wired into its shot list** and passes `tsc`. A scene that exists but is not in a shot list does not count.
- Gates per pushed step: `pnpm exec tsc --noEmit -p sites/vova`, `pnpm lint:files <your files>`, `pnpm exec prettier --write <your files>`. At the end: `pnpm check:masd`, `pnpm masd:clusters`, `pnpm type-overlap`, `pnpm knip`, `pnpm test` — all green on your branch, fixing what your own change caused. Then run the repo's `/dry` and `/tend-prose` skills over your own diff. Skip `pnpm build` and `./scripts/vet.sh`: the lead runs them once.
- A check that fails for a reason outside your files: name it in your report, do not chase it.
- No lint-suppression comments. A `masd-disable` marker is the operator's to grant: if `check:masd` asks for one, restructure, or name it in your report.
- Look at motion, not only stills: a moving scene is judged from three or four stills a few frames apart, or from `pnpm film:clip --from <s> --to <s>` over a couple of seconds (it writes `tmp/clip/*.mp4`; pull frames with ffmpeg).
- Write in English, in the session and in the code. Work on your own branch, never open a PR, never touch `main`.

## The rules that changed

- **Flicker**: "no full-frame flash faster than three a second" still holds everywhere **except the breakdown** (1:35 to the end), where the operator wants it: «мелькание -- в этом месте приветствуется, эпилептиков уже отвадили». The film now opens on a photosensitivity warning.
- **Words on screen**: the sung line is on screen through the whole clip (package W draws it as one overlay over every scene). Scenes do not draw the current line themselves; a scene's own diegetic writing (the ward wall's three words, a channel's captions) stays.
- **The meadow is not seen before the chorus.** The intro is no longer the kids' show.
- **The film outlasts the song**: `POSTROLL` (in `@/clip/shared/score`, 5 s) is silence after the master ends; song time runs past `SONG_SECONDS` through it.

## Storylines and the pools

The clip intercuts "storylines": the meadow, the ward wall, the gig, the channels (the aerobics show among them), and two new ones this wave — **the rocket ears** (package G) and **the spoon bunny** (package S). The operator wants the intercut rotations (chorus, bridge, breakdown) to draw on them more.

Widgets cannot import each other, so storylines meet only in the shot files under `src/clip/pages/horowo-clip/ui/`. A package that cuts a rotation (C, B, D) keeps **the pictures it rotates through as a named array of `Drawing`s at the top of its shot file**, filled with what exists on its branch today; the lead appends the new storylines' drawings at merge. So design your rotation to take one more entry without a rewrite, and say in your report where each new storyline should enter.

## The packages

Each owns the files named and nothing else. `src/clip/shared/*` and `src/clip/entities/*` are shared ground: add a new file and one export line rather than reshaping what is there, and name every change outside your own files in your report.

### E — the engine: warning, ident, sound, the film's ends, the jaw

Owns `src/clip/shared/score/{song,jaw,voice-data}.ts` and their tests, `src/clip/pages/horowo-clip/ui/{player.ts,clip-stage.tsx,standalone.ts,shots-ident.ts}`, `src/clip/scripts/*`, `src/clip/shared/tape/test-card.ts`.

> 0- небольшое вступительное слово белым по чёрному, про эпилептикам не смотреть (нормальная фразировка, но не очень длинная)
> 1- вступление-заставка: можно шип добавить (негромкий) и бип-бип-бип на надписи, всё это держать подольше
> 2- […] Ещё, движения челюсти не совпадают со словами

- **The warning card** opens the film, before the ident: white on black, calm, a few seconds, long enough to read twice. The wording, in Russian, unless you find a better one of the same length: «ВНИМАНИЕ» / «В клипе много вспышек и мерцания.» / «При фоточувствительной эпилепсии лучше не смотреть.» Draw it with the lettering kit's plain rendering or the tape's dot face, whichever reads as a sober card — it must not look like part of the joke.
- **The ident, longer and with sound**: the snow, then the test card's three lines («ТЕЛЕКАНАЛ», «ГРЁБАНЫЙ БАЛ», «ПРЕДСТАВЛЯЕТ», `T.ME/FKNBALL` under them) arriving one by one, each on a **beep**, over a **quiet tape hiss**; hold the finished card a moment before the song's first hit. `PREROLL` grows to fit the card and the longer ident (the score keeps song time, negative through the pre-roll; nothing else may assume its value).
- **The sound is one source for the page and the mp4.** Recommended: one function that builds the hiss and the beeps on a `BaseAudioContext` from a small table of times, run on an `AudioContext` by the page and on an `OfflineAudioContext` by `film:clip` (rendered in the headless page, pulled out as WAV, mixed by ffmpeg with the song delayed by `PREROLL`). No committed audio file, no second hand-kept copy of the timings in an ffmpeg filter.
- **The film's far end**: the player, `bundle:clip` and `film:clip` run to `SONG_SECONDS + POSTROLL`, the audio simply ending; `?t=` holds a still anywhere from `-PREROLL` to that end.
- **The jaw.** The operator sees the mask's jaw out of step with the words, plainest in the intro where the voice is alone. `jaw(t)` comes from the vocal stem's envelope (`voice-data.ts`; the stem is `Media/audio [vocals].wav` in `vovas-music/horowo`, see `measure-clip.ts`). Find the cause before changing anything: cross-correlate the stem's envelope with the master's vocal band for a constant offset, check the envelope's smoothing and its rate against `words.ts`'s word spans in the first stanza (they agree with the master's onsets to a frame), and check that every reader passes song time, not film time. The fix is done when the jaw is open inside each word's span and closed in the gaps between lines through the first stanza, shown by a test.

### W — the words on screen

Owns `src/clip/shared/score/words.ts`, a new slice for the overlay, and the one call that draws it over every frame (in `player.ts`'s frame function — E owns the rest of that file, so touch nothing else there).

> 3- весь клип должен быть с текстом на экране (именно текущих слов-строчек). не обязательно супер-заметно, но в общем стиле, можно в разных частях экрана, по ситуации

- The published words are `sites/vova/public/music/songs/horowo.md` (the `lyrics:ru` block); `words.ts` times every word. Build the **lines**: each published line with its span and its words' spans, the seven verse «(Хорошо!)» calls (`VERSE_CALLS`) and every chanted «Хорошо» (`CHANT`) included as lines of their own, the breakdown's shouts too. Check the later sections' timings against the vocal stem before trusting them.
- The line is drawn **in the idiom of the layer it is over**: on a broadcast, the tape's dot face (`dotText`) like a karaoke caption of the channel; in reality, hand lettering from `@/clip/shared/lettering`. Words arrive as they are sung and the line stays until the next one. Not loud — it is an accompaniment, legible when looked for.
- **Placement moves with the scene**: a table from time spans to an anchor, an idiom and a size, a section at a time to begin with (the intro is a face on black in close-up — the line goes under or beside it; the breakdown may throw single words big). The scenes under you are changing in this same wave, so keep the table one small file the lead can retune after the merge, and export nothing a scene must call.
- Nothing during the warning card or the ident.

### I — the intro: a face on black

Owns `src/clip/pages/horowo-clip/ui/shots-intro.ts`, a new widget for it, and removes `src/clip/widgets/kids-show` if nothing else uses it.

> 2- интро: неправильный фон, должно быть только "лицо" аватара, крупным планом (возможно даже крупнее чем чтоб полностью влезало), на чёрном фоне, на биты можно добавлять в углу какие-то из наших метафор -- солнце, зайчиков, таблетки, кубики, чёрточки.

- 0:00–0:19: the puppet's masked head alone on black, so close it runs off the frame — the red LED eye, the human eye, the hinged jaw singing the first stanza. `head(pen, look, seed)` is the head; scale it far past what it was drawn for and check the line weights and the boil hold up at that size.
- The section hits once on each bar's first beat with nothing between (`pulse`, `KICKS`): on a hit something lands in a corner — the cardboard sun, a bunny, pills, letter blocks, tallies — one emblem a hit, small against the face, gone or changed by the next. The face reacts to the hit too (the eye snaps to the emblem, the camera punches in a step). Pills are new: draw them in your widget.
- «Как, сука, хорошо» (16.12–17.88) keeps its jaw dropping all the way; the section ends into the band's entry at 0:19 however lands hardest — the old fall into static is yours to keep or replace.
- **Also export the same face as a drawing for the chorus's opening**: at 0:43 the song comes back to «не сдохнуть бы от счастья» and the picture breaks to this face on black for those words, before the meadow bursts in on «счастья» (package C leaves that span black; the lead wires your export in). Name it in your report.
- The jaw is being re-timed by package E; use `jaw(t)` as it is.

### G — the gig, and the rocket ears

Owns `src/clip/widgets/gig`, `src/clip/features/ear-fireworks`, `src/clip/pages/horowo-clip/ui/shots-double.ts`.

> 4- дабл-тайм мясо должно быть намного динамичнее и мяснее, дёргающаяся камера, разные части "музыкантов" и пр.
> 5- сюжету с взлетающими ракетами-ушами уделить больше времени, и его чаще вставлять где в принципе вставляем перемежения

- 0:19–0:28, double time, instrumental. Today: a wide shot and four close-ups, cut every beat or two. Wanted: violence. A camera that jerks and overshoots on the kicks, cuts down to the half-beat, and **parts of the players** in extreme close-up — a fretting hand on the neck, sticks on a skin, a pick hand, the jaw, an LED eye, a boot on the pedal, a headstock swinging through frame — tilted, cropped, never centred. The players are `player(pen, role, …)`; a part is that drawing under a hard crop and a big scale, or drawn fresh where the rig does not hold up that close.
- **The rocket ears become a storyline**: the studio audience is a row of bunny ears, and they lift off like rockets (`studioAudience`, `earFireworks`). Give it a progression a viewer can follow across returns — ears twitching, ignition and smoke, lift-off, climbing through the dark, bursting as fireworks — as one export taking a progress `0…1` (and whatever framing it needs), so each return is further along. It gets real time inside the double section and is exported for every other rotation: the chorus, the bridge (bent, as a half-dream) and the breakdown. Name the exports in your report.
- Keep `gigInsert`, `gigClose` and `gigWide` exported (the chorus uses `gigInsert`), reworked as you see fit.

### V — the verse's bedroom

Owns `src/clip/widgets/bedroom`, `src/clip/pages/horowo-clip/ui/shots-verse.ts`.

> 6- куплет -- в принципе ок, но, кажется, сцена с сидящим в кровате слишком засиживается, должно быть какое-то минимальное развитие, камерой или самой сценой.

- 0:28–0:43. The verse works; the man sitting in bed is held too long unchanged. Give the room a development across the seven lines — the camera creeping in or cutting to new angles line by line, the room itself changing (the wallpaper's bunnies turning to look, the TV's light, the hole in the wallpaper, the sweat of «в поту прохладном и сочном») — so no return to the bedroom shows the frame it left. Each line's picture should answer its words.
- The seven «(Хорошо!)» calls stay cuts to a channel (`channel(n, nearness)` from the channels widget, not yours to edit).
- **Line 6, «Ложка новая с секретом» (the call at 37.81)**: its picture will be the spoon bunny's first appearance (package S; the lead wires it in over the answering line). Leave that line's bedroom shot a separate entry in the shot list so it is one line to swap.

### S — the spoon bunny

Owns a new widget for it, and the last entry of `src/clip/pages/horowo-clip/ui/shots-prebridge.ts` (the pre-bridge is otherwise approved as it stands — change nothing else in it).

> 14- last but not least, новый сюжет для "ложки новой": мы видим зайчика со спины, едящего что-то ложкой из миски. Когда мы приближаемся, он резко поворачивается, и там окровавленные зубы со свисающим изо рта человеческим глазом. Этот reveal однократно перед мелодичным бриджем.

- A new storyline. **The back view**: the bunny from behind at a table, hunched over a bowl, the spoon going up and down on the beat — cosy, a children's-book picture, with something off (the sound of it is in the shoulders). Exported taking a nearness `0…1`: each return the camera is closer to its back. It first appears in the verse on «Ложка новая с секретом» and comes back in the chorus's rotation.
- **The reveal, once**: at the very end of the pre-bridge, just before the melodic bridge opens at about 1:17, the camera is right behind it — and it snaps round in a few frames: bloody teeth, a human eye hanging from its mouth by the nerve, the spoon still in its paw. Hold it long enough to be seen and not a frame longer, cut hard into the bridge. Time the snap to the music (`pulse`, `KICKS`, `CHANT`). This is the clip's one outright horror image: draw it to be looked at.
- The bunny entity (`@/clip/entities/bunny`) has no back view and no such face: draw them in your widget, or add files to the entity if they belong to the noun.
- Wire the reveal yourself as the pre-bridge's last shot; name the back view's export for the lead to wire into the verse and the rotations.

### C — the chorus

Owns `src/clip/widgets/meadow-party`, `src/clip/pages/horowo-clip/ui/shots-chorus.ts`, and the aerobics show inside `src/clip/widgets/channels` (that one show only).

> 7- "не сдохнуть бы" -- сломаи на чёрном фоне, чтобы припев с поляной (теперь она появляется впервые) входил неожиданно, и сама поляна появляется на "счастья"
> 8- "зарядке" из куплета тут тоже уделить больше времени, она прикольна
> 5- сюжету с взлетающими ракетами-ушами […] чаще вставлять где в принципе вставляем перемежения

- 0:43–1:00, half time, faux-happy. The chorus opens on «Так хорошо-шо-шо не сдохнуть бы от счастья»: **the picture breaks to black for «не сдохнуть бы»** (leave that span a single black shot of its own — the lead puts package I's face on black there), and **the meadow bursts in exactly on «счастья»**, the first time the clip shows it. Find «счастья» in `words.ts` and against the vocal stem. Make the entrance a shock: full colour, everything mid-hop, nothing easing in.
- The rotation after it (today `'MMWMMGMWMMGW'`: meadow, ward wall, gig) takes more storylines: **the aerobics show** (the channel in `shows-night.ts`/`shows-day.ts` — find it; give it real time, more than one slot, and enrich the show itself since the operator likes it: «она прикольна»), and slots for **the rocket ears** and **the spoon bunny's back view**, which the lead fills at merge (see "Storylines and the pools"). The meadow stays the home picture and the ward's scratching must still finish its three words by the chorus's end.
- The second passes left the meadow escalating pulse by pulse; keep that.

### B — the bridge, and the fade before the breakdown

Owns `src/clip/widgets/ward` (the bridge's shots and the room), `src/clip/pages/horowo-clip/ui/shots-bridge.ts`.

> 10- бридж. Идея с засыпанием хорошая, но должно быть больше динамики (постепенный зум на лицо засыпающего при приближающемся кролике), и больше перемежения с сюжетами, возможно немного галлюциногенными (вращение, искажение, зумы), типа такое "предзасыпательное" тревожное состояние
> 11- перед брейкдауном, где небольшое затизание -- обманчивый фейд ту блек с пульсаццией на "о о о о о"

- 1:17–1:35, quarter time, the one tender stretch: the man in the ward falling asleep. The spine of it is **one slow zoom onto his face**, the eyelid going down, **while the bunny comes nearer** behind or beside him step by step and at last sits down next to him (never built so far — build it).
- **Cut into that zoom, the clip's other storylines as he sees them on the edge of sleep**: the meadow, the gig, the channels, the wall — spinning, warped, zoomed, drifting, the anxious half-dream before sleep. Bend them with canvas transforms (rotation, scale, shear, a wobbling clip, mirrored halves) — no `ctx.filter`. Write the bend as a wrapper that takes any `Drawing` and returns one, in a new file under `src/clip/shared/timeline` or `shared/ink`, and keep the storylines it wraps as the pool array in your shot file. The inserts get longer and stranger as he sinks; the returns to his face show the zoom has moved on.
- **The fade**: in the lull before the breakdown slams in at 96.1 s the voice sings «о о о о о». The picture fades to black as if the clip were over — and the black **pulses** on each «о» (find them on the vocal stem's envelope; `jaw(t)` peaks there), a little picture breathing back each time — before the breakdown's first hit. The breakdown is package D's; yours ends where the section does.
- `wardInsert` (the chorus) and `wardHole` (the breakdown) are used by other packages: keep their exports and what they show.

### D — the breakdown and the ending

Owns `src/clip/widgets/ending`, `src/clip/pages/horowo-clip/ui/shots-breakdown.ts`, `src/clip/entities/snow-globe`.

> 12- брейкдаун. должно быть супермясо. Намёки на него есть и сейчас, но должно изменяться больше, на битах, можно даже прямо на бочках (мелькание -- в этом месте приветствуется, эпилептиков уже отвадили)
> 13- на заключительном зайчикее вместо "хорошо" -- "t.me/fknball" (соответственно сверху подпись не надо). заключительный зайчик появляется только на последнем "хорошо!", и потом отдаляется уже под тишину

- 1:35 to the end, a new slow tempo (102 BPM, opening on its slam at 96.1 s), stabs and holes. Today: a ward "hole" as the base with 0.28-second stabs on thinned kicks. Wanted: **the most violent stretch of the clip.** The picture changes on every beat and on the kicks themselves (`KICKS`, `punch`, `pulse`): whole pictures swapped on a kick, a storyline per hit, inverted and torn (`wear` near 1), frames repeated and stuttered like a tape chewing itself, hard black between hits. The flicker rule is lifted here. Keep what the picture cuts between as the pool array in your shot file — everything the clip has shown (meadow, gig, channels, bedroom, ward, and the new storylines the lead appends).
- The song's holes (silences) still read as holes: something still and wrong, different at each return.
- **The ending**: the bunny holding the snow globe appears **only on the last «Хорошо!»** — find that shout on the vocal stem; it is the song's last word — not before. Then, in the silence after the master ends (`SONG_SECONDS` to `SONG_SECONDS + POSTROLL`; the constant is yours to lengthen if the pull-back needs it), the camera pulls away from it in clear steps — the ward window, the hospital, the globe in the paws — and the tube switches off. The globe's plaque reads `T.ME/FKNBALL` where it read «ХОРОШО», and no caption sits above it.
- Stills past the song's end work once package E's player change lands; until then the frame function itself draws any time you pass it.

## Stills, and the report that ends a package

The still recipe is wave-2's (`pnpm -s bundle:clip && node tmp/still.cjs <seconds> tmp/s.jpg`).

When your package is wired and its gates are green, commit three or four stills that show it best as JPEG, 1280×720, quality 78, under 150 KB each, at `docs/remove-before-merging/frames/w3-<package letter>-<what>.jpg`, push, and send **one** `send_message` to the lead's session `session_01DaohkFDn2a9kRmU5jM3ctm` with: your branch and head; what is built, by export name; what is left or weaker than you wanted; the gates' results; every change outside your own files; and, for a storyline or a pool, where it should be wired. Then stop.

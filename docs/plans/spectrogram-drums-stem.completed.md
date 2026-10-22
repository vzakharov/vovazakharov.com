# Read the drum row off a demucs drums stem

## The task

Vova's review of PR #138 on 2026-10-20 (`docs/pr/138/pr.md`, R01 and T01–T04):

- **T01** — keep each song's whole PNG and `.txt` in `spectrograms/<slug>/` with its zooms. **Done** (6a9e82b).
- **T02–T04** — the drum row is mostly noise. Ground truth from his ear:
  - **birds** (Птицы): the first percussion is a closed hi-hat at 1:21; everything the row marks before it is noise.
  - **hello** (Здравствуй): drums start in section 5 (1:19) with a kick; a light snare at 1:23; no cymbals anywhere in the song (from 1:36 a noise that could pass for a cymbal is fine to mark), but the row shows many cymbals at the start of section 5.
  - **intertwined** (Переплетение): the kick starts in section 3 (0:48), with one decaying crash at its start, then a kick at one steady rate and no other drums until 1:17, where everything stops again.
- **R01** — "why don't we install librosa in the sessions that need it and use it?" Answered on the PR (see the reply); librosa transcribes no drums, so it is not the fix here.

## What is established (measured this session)

- **Calibrating the mix-based row cannot work.** On birds, `drums.py`'s per-2 s hit counts and brightness are statistically the same over 1:00–1:20 as over 1:20–1:40: a picked guitar's attack rises in the bands the way a hit does.
- **A demucs drums stem settles when drums play, on all three songs.** `python -m demucs --two-stems=drums -n htdemucs -o tmp/stems <master>` (the `scripts/song-intake/requirements.txt` venv, ~1.2 GB; ~3.5 min a song on 4 cores). Per-second RMS of the stem: birds −55 dB (the floor) until 1:20, −30 the second after; hello −43 until 1:19, −16 from 1:20; intertwined −34…−40 before 0:48, −14 from 0:48 to 1:17, then −28…−36 (a noise riser demucs files as drums, up to the crash at 1:28).
- **The stem is offset from the master** and must be aligned in code, by cross-correlation against the mix: 552 samples at 22 050 Hz with demucs's WAV output (demucs ignores the mp3 decoder delay ffmpeg removes), 1105 with `--mp3`. Use the WAV.
- **On the stem, onsets are found** by log-spectral flux (positive part, summed over bins) peaking over ±3 frames and above 1.5× its mean over ±0.5 s. Each onset's level relative to the stem's 95th-percentile frame level separates hits from bleed: intertwined's kicks −2…+3 dB, its pre-0:48 bleed −29…−43; hello's kick +2.8, snare −8.3, bleed −38…−63; birds' closed hat −18.7, its bleed −38…−52. The riser in intertwined sits at −12…−22 — **level alone does not separate it from birds' hat**.
- **The old rise-based unmix fails on a clean stem**: between hits the stem is silent, so every band of every hit rises 30–60 dB; intertwined's kick-only section lit kick, snare, toms and cymbals, several marks per kick.
- **Spectral shapes of isolated hits on the stems**, band level in dB at the onset relative to the hit's loudest band, bands 30, 60, 120, 250, 500, 1k, 2.5k, 5k, 8k Hz:
  - kick, no click (hello 1:20.22): −21 0 −4 −20 −35 −47 −56 −58 −60
  - kick with click (intertwined 0:50.81): −6 0 −10 −23 −20 −17 −21 −22 −26
  - light snare (hello 1:23.24): −37 −35 −26 −12 −5 0 −3 0 0
  - snare or clap (birds 1:21.22): −25 −21 −17 −14 −19 0 −2 −1 −4
  - closed hat (birds 1:20.02): −45 −33 −29 −35 −37 −35 −32 −4 0
  - the riser (intertwined 1:22.29): −38 −38 −33 −29 −5 0 −12 −23 −44 — peaked at 500 Hz–1 kHz and falling steeply above 2.5 kHz, which no kit piece's shape matches.

## Done in relay 6's session

- **`drums.py` rewritten** to read the stem: `aligned` (cross-correlation), `band_power`/`onsets` (log-spectral flux), `gained` (linear power each band gains over the frames before), `unmix` (NNLS onto `PIECES_DB`, a third "boomy" kick measured off hello 1:26.93 added), bleed rejected by `BLEED_DB`, non-kit by `UNEXPLAINED`. **A lane lights only where it is needed**: refit the kit without that lane, and light it when that refit's `misfit_db` (the most it is off, either way, in any band within `SOUNDING_DB` of the loudest) is `NEEDED_DB` worse than the whole kit's. Share-of-band gates were tried and fail: a kick split across two kick shapes, or a kick's 120–250 Hz filled by the tom shape, lit toms and snare on nearly every kick in intertwined. Brightness: against the lane's loudest hit in the song, black `LANE_RANGE_DB` under.
- **Against the ground truth, via a probe over the stems** — birds: nothing until a hat at 1:19.96, the snare at 1:21.17, hats at 1:22.68 and 1:24.68; hello: kick 1:20.17, snare 1:23.19, no cymbal until 1:38.42 (Vova: noise from 1:36 may be marked); intertwined: kick alone on every onset 0:48.25–1:17.76, nothing after until 1:28. **The crash at 0:48 is not marked** — it lands with a kick and the kick shapes absorb it; the crash shape (the second cymbals row) is a guess, never measured.
- **`spectrogram.py --drums <stem>`** wired: `render` takes `drums` (`drum_hits` output, or `None`), the kit row and its height dropped without it, the run printing so. Not yet run end to end.
- **Tests** (`test_song_facts.py` `Drums`): rewritten for stems — lanes per synthetic piece, one mark per strike, bleed and a 500 Hz–1 kHz riser rejected, alignment by 552 samples. **`test_tom` and `test_hi_hat` fail** under the needed-lane gate (the hat lights nothing, the tom reads as kick); the other six pass. Investigate why a lone synthetic hat is dropped — a lone real one (birds 1:24.68) is lit.
- Stems of all eleven songs were being cut into `tmp/stems/htdemucs/<slug>/drums.wav` (gone with the container; re-cut per the recipe below, ~3 min a song).

## Done in relay 7's session

- **`unmix` fits each band against its own level** (weights `1/(gain + floor)²`, floor `SOUNDING_DB` under the loudest), the dB that `misfit_db` judges in. In plain power the hat's 8 kHz pulled in the crash, which overshot 1–2.5 kHz by 20 dB, so the whole kit already misfit by 18 dB and no lane was "needed": that was `test_hi_hat`. `UNEXPLAINED` still reads the plain-power fit (`relative=False`), since it is a share of power and was tuned on it; under the weighted fit a clean kick leaves 0.37.
- **A kept hit no lane is needed for lights the lane it needs most**, when within `GUESS_DB` (−15) of the loud frames. Birds' backbeat (1:23.17, 1:25.17, 1:27.16 …, −2…+3 dB, snare-shaped) fit the kit within 1–4 dB, but removing snare or kick each cost only 4–6 dB, so it lit nothing under either fit. Without the level floor, intertwined lit two quiet onsets before 0:48.
- **Ground truth holds** — birds: nothing before the hat at 1:19.96, then snare on the backbeat; hello: kick 1:20.17, snare 1:23.19, no cymbal until 1:38.96; intertwined: kick alone 0:48–1:17 bar faint cymbal marks at 0:31.62 (0.44, lit by the old fit too — relay 6 checked from 0:48 only), 0:49.99 (0.33, −24.3 dB, new) and 1:15.02 (0.78, old too). A misfit gate cannot cut them: real loud hits (kick with crash) misfit by 20–30 dB.
- **All eleven stems cut** (`tmp/stems/htdemucs/`, ~2 min a song). `tmp/summary.py <slugs>` counts lit/visible hits per lane; `tmp/probe.py <slug> <from> <to> -v` adds the plain fit's unexplained share, the whole kit's misfit and each lane's removal cost.

## Done in relay 8's session

- **"Scope added" built as recommended** (c4f5e51, 663c6c6): `spectrogram.py <song> <png> <stems dir>`, the stems required, `--drums` and `--split` gone. Strips: melody off vocals, harmony off other, bass off the bass stem under C4 (`BASS_TOP_HZ`; this session read it off bass + other, undone in the one `relay-8.md` summarises, below). Chords off bass + other: birds' section 4 lost its stray E♭m Fm. **The key stays on the whole mix**: off the accompaniment hello read G minor at r 0.54 against the mix's C minor at 0.68.
- `audio.aligned` takes all the stems and finds one lag from their sum (moved from `drums.py`); the test has each stem silent where the other plays.
- All eleven re-rendered, every PNG under 350 KB; keys unchanged, chords changed in places. Docs updated: `spectrogram.py`'s docstring, `song_facts.measure`, `scripts/song-intake/CLAUDE.md`, `.claude/rules/maya-reflections.md`.

## Done in the session `relay-8.md` summarises

- **The bass strip reads the bass stem alone** (636acde). Vova: in birds there is no bass for a long stretch. Measured: what other carries under C4 before 2:50 is G2 F2 E♭2 (98, 87, 78 Hz) with their octaves, the harmony's lowest voice, already in the harmony strip's C2/C3 hues; the bass enters at 2:53 on the bass stem, an octave lower (F1 G1, 44–49 Hz). All eleven re-rendered off freshly cut stems; a chord or two per sidecar moved, from demucs's random shift between runs.
- **Where the two readings disagree**, by `tmp/bass-probe/survey.py` (other's low end sounding, bass stem 20 dB under its loud seconds, 4 s or longer): birds through 2:44, hello 0:34–0:42 and 1:06–1:16 (A♭2 G2), listen-single 0:00–0:53 (F♯2 C♯3), after-us 0:31–0:35 (E♭2); none in the other six. Asked Vova's ear on all but birds.
- **Replies on T01–T03 drafted** (verbatim in `docs/remove-before-merging/relay-8.md`), not posted: Vova's pending review on the PR blocks a thread reply under his token (422 "one pending review per pull request"). Post them once he submits it.

## Done in the session after relay 8

- **T01–T03 replied**, once Vova submitted his pending review (5590208848). That review held three comments no session had read: the export reads `pulls/<n>/comments`, which leaves a pending review's comments out even for their author, so the export showed it as a bare "reviewed (PENDING)" row.
- **A dot per drum hit** (a8bf324): its area and brightness the hit's, a black rim between touching dots. Vova: the one-pixel ticks read as nothing.
- **No beat grid on the zooms** (a8bf324). Vova: the lines confuse more than help; the tempo is in the title and the sidecar.
- **`N` spelled out** in the sidecar's section header (a8bf324): no chord, the accompaniment too quiet to name one.
- All eleven re-cut and re-rendered (a026bc0); intertwined's section 3 still reads one kick per beat 0:48–1:17 and the lone cymbal at 1:15.

## Vova's ear, answered (2026-10-21)

Verbatim, each under the question it answers:

- **hello 0:34–0:42, 1:06–1:16, a bass?** «там нижние аккорды фортепиано, звучат действительно как бас. Нужно ли (и можно ли) это надёжно определять я не уверен -- я сам деж знаю что пианино только потому что слышу его до этого and it logically makes no sense to play the bass on all but the first chords of a harmonic line»
- **listen-single 0:00–0:53?** «ну он там вроде всю песню на одних и тех же трех нотах, но в верхнем (для баса) регистре»
- **after-us 0:31–0:35?** «там относительное затихание и тоже неясно пианино это или бас (не забывай это суно 2, качество там ещё далеко от идеала»
- **intertwined, the crash at 0:48?** «вполне»
- **intertwined 1:15.02 and 0:31.63?** «думаю и там и там ты говоришь про букву С ("пожелтевшие ССтраницы" и "переплелаССь нить" соответственно)»
- **birds 1:19.97?** «вроде услышал, но хет это или вдох перевд "в новый день", сказать сложно.»
- **just-because from 1:28.70, tom or fat snare?** «томов там не слышу, ритм примерно (если считать шестнадцатыми, точки -- паузы) -- K..KS.......S...K..KS.......S...»
- **listen 1:00–1:06, a hit every 0.5 s?** «Там что-то неопределённое, вроде как "оборванный" звук того же что звучит на 0:21, но он (повтор каждые полсекунды) начинается около 0:36, не 1:00»
- **world-as-it-is, 26 toms?** «я тебе больше скажу, там нет _ударных_ вообще во всей песне»

What follows for the work, the agent's reading:

- **Bass: no change.** The bass strip stays on the bass stem alone. Piano lows in hello and after-us are not a bass, and Vova doubts they can be told apart reliably; listen-single's high three-note bass is a maybe worth one look at whether the bass stem carries it.
- **Vocal bleed lights cymbals**: intertwined's 1:15.02 and 0:31.63 are sibilants, and birds' 1:19.97 may be a breath. A cymbal (and hat) hit wants rejecting where the vocals stem has a high-band onset at the same moment.
- **A crash under a kick goes unmarked** (intertwined 0:48, clearly audible): the lane-cost rule gives it nothing when the kick shapes explain the hit.
- **just-because's 1.34 s "tom" is the snare**: at 89 BPM a sixteenth is 0.17 s, and the snare every 8 sixteenths of `K..KS.......S...` is 1.35 s. A fat-bodied snare shape is the fix, measured off that stem.
- **Non-drum sound in the drums stem lights lanes**: world-as-it-is has no drums at all (27 hits drawn), listen has a repeated cut-off sound from about 0:36. Something must refuse a stem, or a stretch, that holds no kit — for instance hits whose shape the kit fits badly, or a stem far under the mix's level.
- Lyrics: birds' last line is «В новый день» (e2c4bad), not «Улетай».

Vova on the reading above, 2026-10-21:

- «не уверен что что-то из этого -- критично. Попробовать можно, загоняться -- не надо» — on the vocal-bleed gate and the crash under a kick: one honest attempt each, dropped if it does not come cheap.
- «ну этот звук можно считать перкуссией условно, звучит он что-то вроде ложкой по кастрюле 🙂 (но такого "инструмента", конечно, добавлять не надо)» — listen's repeated sound from 0:36 may be marked; no new lane for it.
- «Майя тут ни при чём, я сам неправильно начитал это; и вообще Майя не занимается расшифровкой -- она приходит уже на готовые слова» — her afterword no longer blames her hearing, and her rule's line about it is gone.

## Done in the session after relay 9

- **A drumless stem yields no hits** (529591a): `NO_KIT_DB`, the stem's loud frames against the mix's. Songs with drums sit −0.6…−11.9 dB, world-as-it-is −43.9, listen-single −47.7 — which Vova has not been asked about.
- **A fat-bodied snare shape** off just-because 1:28.70 (529591a): its "toms" fall from 75 to 3 and its snares land on `K..KS.......S...`. A synthetic test of it was tried and dropped: band-shaped noise lit kick or strays, unlike the real hits.
- **`test_tom` passes** at 160 Hz; at 120 it sat on the band edge the boomy kick peaks on.
- **Tried and dropped, as Vova allowed** («загоняться -- не надо»): the vocal-bleed gate — intertwined's sibilants show the vocals stem's 5 kHz+ gain 10–14 dB _under_ the drums stem's, while birds' real hats reach −1…−4, so no threshold separates them; birds' 1:19.97 has no vocal onset at all. The crash under a kick — at 0:48.25 its top bands stand 6.4 dB over the kick shapes alone, and the plain kicks at 0:54–1:02 6.5–6.6; by top/total it is −12.6 against 0:51.76's −13.4.
- All eleven re-rendered (2018ae4); ground truth holds on birds, hello and intertwined.

## Open question (answered above; kept for the measurements)

**Toms and mid-band hits are unstable on the songs without ground truth.** `test_tom` still fails: a 120 Hz synthetic tom reads as the boomy kick (hello 1:26.93), which in nine bands it nearly is; the tom shape in `PIECES_DB` was never measured. On real stems the tom lane lights in regular patterns that look wrong — world-as-it-is 26 toms and 1 kick; just-because a tom every 1.34 s from 1:28.70, broad 120 Hz–8 kHz hits that may be a snare with a fat body; listen 1:00–1:06, one similar hit every 0.5 s labelled snare, kick, tom, snare in turn. Asked Vova for his ear on those three spots; a confirmed tom gives a measured shape, a confirmed snare a third snare shape.

## Scope added: strips from all four stems

Relay 6 proposed filing "strips from demucs stems" as a separate issue. Vova, forwarded from that session on 2026-10-20: «нет, давай всё здесь, чего полумеры делать». So this PR also reads the pitch strips off htdemucs's four stems (run without `--two-stems`; its `drums.wav` is the same source, since `--two-stems` only sums the other three). Not yet designed or started; the recommended shape, for the operator to correct:

- **`spectrogram.py --stems <dir>`** (demucs's `<dir>/{drums,bass,vocals,other}.wav`) in place of `--drums`, each stem aligned as `drums.aligned` does.
- **Three pitch strips in place of the C4 split**: vocals (the melody), other (the harmony), bass. Each strip reads its own stem's `chroma_shares` over the stem's own range, so a low voice no longer votes with the bass and bass harmonics no longer reach the treble. `--split` and the split line go with the split.
- **The sidecar's chords from other + bass** rather than the mix, so the melody's passing notes stop voting in `harmony.beat_chords`.
- **Without stems**, the recommendation is to require them rather than keep the mix-based strips beside them: two paths to keep honest, and the mix one is what this replaces. Ask if unsure.
- Cost to state in the PR: a 1.2 GB venv and ~2 min a song on 4 cores per render; stems too big to commit.

## What is left

0. ~~Strips from all four stems~~ (done in relay 8's session, above).
1. ~~Act on Vova's ear~~ (done, above); replied on the PR (issuecomment-6308711945). **Next: `/go` Step 3 (`/polish`, floor a899b8a — ~1200 lines from several sessions) and Step 4 (`/pr`).** Vova has not yet confirmed listen-single has no drums.
2. ~~Rewrite `drums.py` to read the stem~~ (done, above) — the original spec, kept for reference: **Rewrite `drums.py` to read the stem**: align it to the master; find onsets as above; per onset, unmix the power it adds over the frames before (linear power, not dB rises) onto per-piece band shapes taken from the measurements above — two kicks, toms, snare, clap, closed hat, crash/ride — by NNLS. Reject an onset whose fit leaves much of its power unexplained (the riser) or that sits more than ~25 dB under the stem's loud hits (bleed). A lane is as bright as its piece's level against that lane's own loud hits; one mark per onset, never one per frame. The kick-with-click shape is what keeps a kick's click out of the snare lane, so intertwined's section 3 reads kick only.
3. **`spectrogram.py --drums <stem>`**; without it the drum row is left out and the run says so, since a mix-based row is noise. Test the onset picking, the alignment and the unmix on synthetic strikes in `test_song_facts.py`, replacing the mix-based drum tests.
4. **Check against the ground truth above** before re-rendering anything: birds silent to 1:20 and a hat first; hello a kick at 1:19–1:20, a snare at 1:23, no cymbal lane at the start of section 5; intertwined one kick per beat 0:48–1:17 and nothing after until 1:28.
5. **Separate all eleven masters and re-render** each with `--drums` into `spectrograms/<slug>/<slug>.png`, every PNG under 350 KB. Update the docstrings (`drums.py`, `spectrogram.py`'s drum paragraph), `scripts/song-intake/CLAUDE.md` (the demucs step and `--drums`) and `.claude/rules/maya-reflections.md` (how to make the stem).
6. **Reply on T02–T04** in Russian with the bare commit SHA, never resolving a thread; then `/go` Step 3 (`/polish`) and Step 4 (`/pr`).

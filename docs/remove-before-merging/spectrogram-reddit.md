# Reddit feedback on `spectrogram.py`

What three threads suggested for `scripts/song-intake/spectrogram.py` — making a song readable at a glance by a model that cannot hear it — and which ideas are worth building. Read through Arctic Shift, which lags live Reddit, so a comment younger than a few hours may be missing.

| Thread                                                                        | Post id   | Comments seen | Last read        |
| ----------------------------------------------------------------------------- | --------- | ------------- | ---------------- |
| [r/DSP](https://www.reddit.com/r/DSP/comments/1x29wdc/)                       | `1x29wdc` | 39            | 2026-10-11 14:20 |
| [r/ClaudeAI](https://www.reddit.com/r/ClaudeAI/comments/1x29x26/)             | `1x29x26` | 17            | 2026-10-11 14:20 |
| [r/claudexplorers](https://www.reddit.com/r/claudexplorers/comments/1x2a0q2/) | `1x2a0q2` | 3             | 2026-10-11 14:20 |

The image the threads saw is the old one: spectrogram over a waveform coloured by dominant pitch. Since then, on `main` (PR #127): chromagram strips in place of the coloured waveform, each cell coloured by its octave, and dashed section boundaries from a novelty curve.

## Verdicts

### Already in

- **Chromagram, pitch by row rather than hue** — Sentient_Dawn (#1), gmccolgan, Dapper_Profession. Landed as the bass and treble strips.
- **Section boundaries** — Dapper_Profession's novelty strip, half of Sentient_Dawn's #2. The novelty curve's peaks are the dashed lines; the square self-similarity matrix stayed out, since it has no place on a shared time axis.
- **Drop the weaker frequencies** — ready-eddy. Only spectral peaks within 30 dB of a frame's loudest vote in the strips.

### Worth building

1. **A text sidecar with the exact values** — Sentient_Dawn (#4), gmccolgan (#1, #3). The strongest idea in the threads: a model reads `G minor, 0.80` exactly and a hue approximately, and the cold reading behind `chromagram-proposal.md` failed on exactly that. A short file beside the PNG with tempo, key with its confidence (Krumhansl, as the proposal used), section timestamps (already computed for the dashed lines), loudness per section and a chord per bar. The picture keeps the shape, the text carries the numbers, and "at a glance" survives because the text is a dozen lines, not a report.
2. **A blind test** — gmccolgan (#6), ktpr. Read each Крылья spectrogram cold, freeze the reading, then check it against librosa: key, bass line, tempo, form. It is what showed the hue encoding wrong in the first place, and the only way to know which of the other changes help. ktpr's point is the half that comes first: that list of questions _is_ the definition of "at a glance", so writing it down settles what the picture owes the reader. Cheap: ten songs, a subagent each.
3. **Tempo in the title** — Sentient_Dawn (#3). One number, from an onset envelope the script can compute with numpy alone. Beat lines themselves are not worth it at this scale: a four-minute song at 120 BPM puts beats 3 px apart on a 1400 px plot, so they would read as a grey wash. Bar lines (every 4 beats, ~12 px) are the most a whole-song view takes.
4. **A zoomed render of a time range** — gmccolgan (#2). A `--from/--to` pair, so a reflection can look closely at the bridge. Small, and the only way to see beats.
5. **Tuning off A440** — polvalente. The strips bin each peak to the nearest semitone of A = 440 Hz, so a song tuned a quarter-tone off splits every note across two neighbouring rows, and the reading is wrong in the way that looks most like a real chord. The fix is cheap: take each frame's peaks' deviation from the nearest semitone in cents, use the median as the song's tuning, shift the bins by it, and print the offset in the title (or the sidecar) when it is more than ~15 cents.

### Maybe later

- **Melody as a pitch contour or note list** — gmccolgan (#2, #3). The treble strip shows the tune's pitch classes but not its line; a pitch tracker on the demucs vocal stem, which the pipeline already produces, would draw it. Worth it once the sidecar exists, since the note list belongs there.
- **Source separation first** — BatchModeBob. Vova's worry in reply was crowding, but stems need no extra panels: the demucs run the pipeline already makes for the lyrics could feed the existing strips — the bass stem to the bass strip, everything but drums to the treble one. That is the fix for the drums smearing the bass strip in dense stretches (2:52–3:57 in Птицы, per `chromagram-proposal.md`). Costs a demucs run per song, minutes on CPU, which the song has already paid for its lyrics.
- **CLAP mood scores** — gmccolgan (#4). Pulls in torch for ~64% accuracy on mood quadrant, by his own benchmark. Майя's reaction is better grounded in what she can actually read than in a classifier's label.
- **CQT instead of log-binned FFT** — simply-chris. The log rows already approximate it; a CQT would sharpen the treble's timing, which nobody has missed yet.

### Not worth it

- **Mel scale** — thedefibulator, polvalente. Close to linear under 1 kHz, where the bass and most melodies live, so it squashes them; log keeps every octave the same height. Already answered in both threads. polvalente's rejoinder — mel models perception, not just log frequency — holds for a listener, but the reader here is a model reading notes off rows, for which equal octaves matter more.
- **Vectorscope** — coronelkentucky. Stereo image, a mixing question, and no time axis. Already answered.
- **A CNN/VAE/LSTM in front, audio-native models, Music Flamingo** — Masterkid1230, always_wear_pyjamas, polvalente, dharma-1, averi_fox. These answer "how would you train a music model", and there is no training data or labels here; the reader is Claude, which already reads images. Music Flamingo as a second opinion is interesting but is a GPU pipeline of its own.
- **"LLMs can't do this"** — CritiqueDeLaCritique, AvidCoco, and maxm arguing back. No proposal in it; the cold reading in `chromagram-proposal.md` got form, register and voice right off the picture, which is the counter-evidence.
- Nothing actionable: ClemensLode ("ask Claude to process it first"), texasguy911 (a Wikipedia link to the Fourier transform), 2SP00KY4ME (log is how hearing works — true, no change), VS2ute (on seismic data he tried every textbook attribute to see what stuck — the blind test is the cheaper way to find out).

## Reply drafts

Vova posts these himself. Ordered by how much a reply is owed.

### gmccolgan — [r/claudexplorers](https://www.reddit.com/r/claudexplorers/comments/1x2a0q2/comment/pf1jdfi/), unanswered

The longest comment in the three threads, and the most useful.

> Wow, thanks for writing all this up. Funny how much of it converged -- the chromagram (rows, not hues) and the section lines from the novelty curve went in right after this thread, before I'd even seen your comment. The text-next-to-the-picture thing is what I'm most likely to steal next: the picture for the shape, a dozen lines of numbers for tempo, key and where the sections are.
>
> And the blind test -- I kind of did one by accident. Another Claude read the picture cold and got the form right but the key wrong (E minor instead of G minor), which is what killed the pitch colouring. Doing it properly over a whole album is now on the list.
>
> Is Ears public anywhere?

### Sentient_Dawn — [r/claudexplorers](https://www.reddit.com/r/claudexplorers/comments/1x2a0q2/comment/pf1028e/), answered with "Thanks love"

Optional: a follow-up saying her #1 and half of #2 are in. Her point about neighbouring hues is the same failure the cold reading hit.

> Update: your #1 is in -- chromagram strips under the spectrogram, so the note is read off its row now. Colour went to the octave instead, five hues far apart rather than twelve neighbours. And half of #2: the self-similarity matrix itself is square, so it didn't fit under the timeline, but its novelty curve marks the section changes as dashed lines.

### mahaju — [r/DSP](https://www.reddit.com/r/DSP/comments/1x29wdc/comment/pf0rq7y/), answered by others

Optional. The script is public on `main`, so a link is possible.

> librosa is the easy way, as said above. Mine is a ~400-line numpy + matplotlib script, no librosa, if you want to see how the bottom part is done: https://github.com/vzakharov/vovazakharov.com/blob/main/scripts/song-intake/spectrogram.py

### BatchModeBob — [r/DSP](https://www.reddit.com/r/DSP/comments/1x29wdc/comment/pf6drip/), answered with the crowding worry

Optional: a follow-up, since stems turn out not to crowd anything.

> Actually, thinking about it more -- it wouldn't need extra panels. I already split out the vocals for the lyrics, so the stems could just feed the strips that are there: bass stem into the bass strip, everything minus drums into the treble one. That'd also fix the drums smearing the bass notes in the busy parts. So yeah, good call.

### ktpr — [r/ClaudeAI](https://www.reddit.com/r/ClaudeAI/comments/1x29x26/comment/pf65st3/), unanswered

Optional; a short one, since it agrees with where the work is going.

> Yeah, fair. My working definition is roughly: from the picture alone, can it name the key, the bass line, the tempo and where the sections change -- and then check that against what the audio actually says. That's how the pitch colouring got dropped, it failed exactly that test.

### Not worth a reply

- **CritiqueDeLaCritique** ([pf3dty5](https://www.reddit.com/r/DSP/comments/1x29wdc/comment/pf3dty5/)) — a debate, not a question, and the thread already downvotes it both ways.
- **2SP00KY4ME** — right, and asks nothing.
- **simply-chris** — offers a Discord chat; Vova's call whether he wants one.

## Comments seen

So the next read can tell what is new. Ids only; the bodies are on Reddit.

- `1x29wdc`: pf0f7ht pf0gwqm pf0h496 pf0h7kk pf0hsq4 pf0i8cl pf0k54d pf0mc19 pf0mesi pf0mfgp pf0opph pf0p7s3 pf0rq7y pf0s74u pf0s9ij pf0sc0m pf0tqyp pf0u1ki pf0y1sl pf0zj35 pf10ndn pf14xm3 pf15ppw pf17aj8 pf1cjgr pf1r4me pf1r6be pf2j881 pf2wdro pf3as2i pf3dty5 pf4i26v pf4j0o9 pf58b7y pf66tbx pf6drip pf6nogz pf6nv6c pf6nxyf
- `1x29x26`: pf0d6ya pf0e5h6 pf0eg4b pf0eic1 pf0ewkg pf0f29g pf0f2tw pf0f659 pf0fj1t pf0he4f pf0ilqu pf0jxgp pf0lfzd pf0m0ve pf19sn4 pf1c29x pf65st3
- `1x2a0q2`: pf1028e pf10afk pf1jdfi pfain9u

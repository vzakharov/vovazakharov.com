# Bite 2 — worlds from one formula

The contract the lead hands the member who builds bite 2. Its sticker on the
board points here; the board's north star (star 9, infinite worlds) and calls
(`src/island-board/app/config/island/star.yaml`, `calls.yaml`) are what it
stands on, and each call it settles is written below rather than re-argued in
the build.

## What exists when it is done

`/island` looks as it does today: our island, the one Zoltan and Syama drew.
`/island#2`, `#3`, … each open a different world, the same for everyone who
opens that number: one continent the size of Europe in an endless ocean, with
its own capes, bays and islands off its shore. Under all of them, ours included,
the land is one formula — a dome plus a 2D Fourier series — and no longer the
traced rings. Ours is world #1 because its bits are masked to give it.

The operator, on the ask: «я не хочу, чтобы остров задавался "кругами",
"кольцами" или что там. Я хочу чтобы в основе была параметризированная формула».
On the probe's worlds: «пока это правда все равно один остров размером с Европу
посреди бескрайнего океана, но мультиматериковость будем дополнять потом.
поехали!»

## The probe

`bite-2/probe.py` and `bite-2/worlds.py` beside this file are the lead's numpy
probe (run with the system Python, `coast.json` as the first argument, an output
directory second); `bite-2/harmonics.png` and `bite-2/worlds.png` are their
frames. They settle that the idea holds, not how the game does it.

- Our rings rasterized and cut to `|k| ≤ K` harmonics come back with this much
  of the land area wrong: K=32 9.2%, K=64 2.5%, K=128 0.7%, K=256 0.1%. The
  finest wave at K=128 is ~80 km.
- Random phases on our own spectrum (amplitude ~k^-1.24, measured off the binary
  mask) give scattered archipelagos, not worlds. A dome plus waves whose
  amplitude falls as k^-2, the waves scaled to 0.45 of the dome, gives one
  continent per world (`worlds.png`,
  `python3 worlds.py <coast.json> <dir> 2.0 0.45`).

## Calls

1\. **The land is a field `f(p) = dome(p) + Σ c_k e^{i k·p}`** over the world's
square, land where `f > 0`, the coast its zero line. Height derives from `f`
(the member chooses how — a rising function of `f` inland, sea floor from it
offshore) where it now derives from the distance to the rings, and the value
noise that today adds hills stays on top, unchanged in role.

2\. **The dome**: an ellipse, `1 − |rotated, scaled p − centre|`, its centre,
two radii and turn read from the world's first bits (the probe's ranges: centre
within ±0.04 of the middle, radii 0.16–0.26 of the square, any turn). It is what
makes every world one continent rather than a scatter.

3\. **The waves**: harmonics up to `K = 128` per axis; amplitude envelope
`|k|^-2`, scaled so the waves' spread is 0.45 of the dome's height; phase and a
unit-normal amplitude factor per harmonic from the world's bits. Finer than `K`
stays the existing per-tile noise, seeded by the world number — the coast
fractalling as you approach (call 4) is a later bite, and may become the same
series continued.

4\. **The bits are an infinite hash, and ours is a mask** (star 9, the "opaque
number hashed whole" option the board's world-number fork argued for). Every
parameter — the dome's four, each harmonic's — is a fixed-width word
`W(N, i) = H(N, i) XOR M(i)`, `H` a counter-mode hash of the world number and
the word's index, `M` a committed mask with `M(i) = H(1, i) XOR ours(i)`, so
world 1 reproduces ours to the last bit and every other number gets bits no one
chose. A word decodes to its value by a fixed map (uniform or normal, by inverse
CDF), the same for every world.

5\. **Ours is fitted once, by a script**, in `src/island/scripts/`: rings
rasterized, a smooth target (signed distance to the coast, clipped, not the
binary mask — the probe's k^-1.24 is the mask's step), minus our dome, then the
FFT cut to `K` and quantized. It writes `M` as committed data beside
`coast.json`, and prints the share of land area wrong and where. Our dome's four
parameters are the lead's to fix from the drawing's bounds, unless a fit of them
is plainly better; say which.

6\. **The bay's strait** (bite 1, review T11: a channel ~19 km wide, kept open
by authored sea strokes) is below K=128's ~80 km. Measure whether world 1 keeps
it open. If not, report the frames and the cost of keeping it (more harmonics
over the whole square, or a band-limited patch) — the lead decides with the
operator; do not reintroduce rings or strokes into the game to save it.

7\. **Runtime**: the series is never summed per vertex. The low harmonics are
turned into a grid once per world, by inverse FFT, in a worker (call 5's
"whole-map tier"), at a resolution the band limit allows, and tiles sample it
smoothly; tiles stay a pure function of `(world, level, x, y)`. The worker
receives the world number, not the field.

8\. **The world number** is the URL hash, `#<N>`, a positive integer; none or
`#1` is ours. Changing it at run time rebuilds the world without a reload.
Nothing else in the UI changes this bite.

9\. **The drawn lakes are land today, and come back as water.** The operator:
«нету озёр с оригинального рисунка (их не было и при прошлом подходе)». The
tracer's hole floor (bite 1, call 1) fills them, so `coast.json` has none — the
white lake by Цитадель, the heart in Нутглена, any other. The fit's target is
the drawing's water, lakes included: the tracer keeps every drawn hole (its
floor lowered or dropped for holes; the lettering it was there for is checked
against the map and named), and a closed `f < 0` inside land is a lake, its
surface for now at sea level. `bite-2/overlay.py` is the lead's check, the
drawing under the formula: it compares against the rings, so after this call it
must show the lakes as red-free water.

10\. **`coast.json` and the tracer stay**, as the fit's input; the game stops
importing the rings. Anything in the game that reads the rings today moves to
the field.

## Out of the bite

Several continents per world, a world picker, coast fractalling past `K`,
rivers, lakes above sea level, naming or sharing a world, your own map.

## Done when

- `/island` shows world 1 at the five heights (orbit, 1,000 km, 10 km, 100 m, 2
  m) on a phone and a desktop, beside today's frames, and reads as the same
  island; the wrong-area share and the strait's fate are in the PR body;
- `/island#2` to `#6` each read as a different continent at orbit and at 1,000
  km, frames posted to the lead through memo;
- the fit is reproducible (`pnpm` script or `tsx` entry, named in the PR) and
  its pure parts tested — the hash, the mask round-trip (world 1 decodes to the
  fitted words exactly), the decode map;
- vet is green on the bite branch;
- its PR, based on `island/stretch-2`, carries the frames and a body saying what
  each call became.

The lead merges the bite once vet is green and it has looked at the frames.

## For the member

- Talk to the lead with `python3 scripts/memo/memo.py post --as member` and wait
  with `wait --as member`; a question the work can go on past is posted and not
  waited on.
- Orchestrate: one build step per agent, the model named on every `Agent` call
  (Opus), each agent in its own worktree and pushing every passing step
  (`.claude/skills/mammoth/notes/subagents.md`).
- End with `/sync-branch` against `island/stretch-2` before pinging green.
- The board is the lead's: propose a change to it through memo.

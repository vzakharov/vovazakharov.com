# v14-note-plant — a note with no flower in view plants one

**Done**: with the flower picker shut, a note or drum key whose sound no
flower in view makes sounds at once at the keyboard's octave
(`instrument.key`) and grows the flower that makes it on a free tuft in view;
a key some flower in view makes plays it as before and grows nothing; no free
tuft in view, the key just sounds (no "nuh-uh"). Picker-open keys unchanged.

- `playKey` (`ui/scene/keyed-flowers.ts`): picker first (`plant`), then the
  key always sounds; answering flowers in view, or `KeyedPlay.sow`.
- `sowingTuft` (same file, pure): one of the tufts in view that is free,
  drawn off the given stream (`pick` in `model/random.ts`).
- `Planter.sowSounding`: tufts from `Grass.inView()` (the near tufts the last
  frame drew, where a tap could land), filtered by `plantableIn` on the
  current stand (so it counts flowers sown earlier this frame), the tuft and
  the seed (`seedSounding`) both off the planter's `sowing` stream, then the
  new reducer action `{ kind: 'sow', seed, foot }` (`model/game.ts`), which
  only appends to `planted` — pickers and selection stay as they were.
- A flower sown this frame counts as in view: `Planter.sownInView` holds the
  key-sown flowers while the scene's clock has not moved;
  `playTheMeadow`'s `inView` is the bed's plus these.
- `FlowerBed.hush(id)`: the key-sown flower opens without its own sound,
  the key having sounded it — otherwise it would sound twice, a frame apart.

**Decided**:

- _Octave and "already in view"_: by pitch class, the octave ignored — as
  `keyedFlowers` already matched. A flower has no octave of its own (its
  note sounds nearest the melody's last, `strike`), so a C flower in view
  answers a C key at any keyboard octave and no second C grows.
- _Sounds at the key's pitch_, unlike the picker-open key plant, whose
  flower sounds through `FlowerBed.reconcile`: with the picker shut the key
  is played, so it keeps the keyboard's octave.
- Touched beyond the owned list, minimally: `flower-bed.ts` (`hush`),
  `tufts.ts` (`Grass.inView`), `meadow-scene.ts` (`Scened.tufts`, passing the
  planter), `scripts/lib/mushroom-probe.ts` (letters K O P Y).

**Tests**: `keyed-flowers.test.ts` (routing incl. a melody on an empty view,
no free tuft, octave; `sowingTuft`; the `sow` reduction).
`scripts/lib/play-keys.ts` gains `playMelody`: F F♯ G♯ C♯ on the opening
view, F struck twice in one frame, grows four flowers on tufts each of its
note, and F struck again grows none.

**Left**: see the commits below for the probe run and the frame.

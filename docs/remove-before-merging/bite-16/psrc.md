# psrc — /tend-prose over bite 16's tail, `src/pages/mushrooms`

Range read: `8abc5a66..origin/claude/mushroom-game-syama-lbirv7` (head 377145a4).

## Done

- Read every added/changed comment in the range (~420 lines) under all four
  lenses. Lens 4: the removed mute (`readMuted`, `toggleMuted`, `muted`,
  `MUTED_KEY`, `drawMuteButton`, `WithMute`, localStorage, "the one silent
  fallback") survives nowhere in the package's prose.
- No narration of the splits found: `pinhole.ts`, `meadow-taps.ts`,
  `ground-grid.ts`, `door-seats.ts` carry present-tense contracts only.
- Rewrapped two docstrings left overlong by in-range edits: `model/notes.ts`
  header, `ui/scene/keyboard.ts` header.

## Left, judged

- `ui/scene/map-view.ts` `MapView` docstring says the map is "drawn once as it
  opens from a snapshot", while `redraw` also runs on every scene `paint` while
  open (resize). Left: the run ended on the context budget before checking
  whether `paint` fires on anything but resize; a successor checks
  `meadow-scene.ts`'s `paint` callers and, if it fires on meadow changes,
  rewrites to "drawn from a snapshot as it opens and on each repaint".

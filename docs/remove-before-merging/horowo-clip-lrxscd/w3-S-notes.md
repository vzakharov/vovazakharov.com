# Wave 3 · S — the spoon bunny

Branch `claude/horowo-clip-w3-s-lrxscd`. The package is built and every gate
passes; the report has gone to the lead.

## Built (`@/clip/widgets/spoon-bunny`)

- `spoonBunny(nearness, creep = 0.06): Drawing` shows the back view. The bunny
  sits at a lamplit kitchen table and eats on `pulse`. Nearness 0 shows the
  room; 1 is right behind its shoulders. There is no bowl, at the operator's
  word; the eating shows through the flaring elbow, the spoon handle past the
  right shoulder and the shudder as it chews. The chorus pool's
  `(along) => Drawing` fits as `(along) => spoonBunny(lerp(0.5, 0.8, along))`.
- `spoonBunnyReveal(turn: Ranged): Drawing` is the reveal. It is wired as the
  last entry of `src/clip/pages/horowo-clip/ui/shots-prebridge.ts`, from the
  last chant to the bridge (76.84–77.66). It turns over
  `[landing − 0.16, landing − 0.02]`, landing on the kick at 77.27, to show
  bloody teeth and a brown eye (the operator's) hanging by its nerve.

## Not yet wired

- `spoonBunny` goes into verse line 6 «Ложка новая с секретом» (37.81, nearness
  about 0–0.3) and the chorus rotation (about 0.5–0.8). That is the lead's
  wiring; knip reports it unused until then.

## Known weak spots

- The face is held for only about 0.4 s. Moving the reveal shot's `from`
  earlier buys more time, at the cost of the channel before it.
- In a single still the eating reads only while the spoon is up.

Stills: `docs/remove-before-merging/frames/w3-S-{room,back,turn,face}.jpg`.

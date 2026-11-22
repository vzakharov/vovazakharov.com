# Common brief: every child of the island-beauty run reads this first

You are one member of a team making `/island` beautiful. The lead is another
Claude session; the operator is Vova, who looks at a preview site and at a board
of frames, and steers now and then. Your own brief names your package; this file
holds what is the same for everyone.

## The world you are working on

`/island` (`src/island/`, mounted by `sites/vova`) is a round, Earth-sized world
drawn with three.js's WebGPU renderer and TSL node materials. The eye falls from
orbit (20,000 km) to two metres above a beach. World 0 is Earth's coastline;
every other number is a generated world.

- **Land** is a cube-sphere quadtree of tiles a worker fills
  (`src/island/entities/terrain/`): `height/model/relief.ts` shapes the ground
  from the distance to the coast and 17 octaves of value noise, the same recipe
  everywhere. Each vertex carries one `height` float; the land shader
  (`src/island/pages/island/ui/ground-lighting.ts`) colours by it
  (`lib/land-colour.ts`).
- **Sky, haze and clouds** are evaluated per fragment in every material and in
  the background (`ui/sky-nodes.ts`, `ui/cloud-nodes.ts`, `lib/clouds.ts`).
- **Two looks** (`ui/scene-look.ts`): plain, the default, and fine, behind key
  B. The fine look runs at 7–14 fps on the operator's M2 Pro; his target is 60.

## What the operator asked for, in his words (translated)

1. "More realistic drawing of the landscape — at a distance patterns are plainly
   visible." Earlier verdicts on the same: "the pattern visibly repeats, and
   apart from the surf and the glints there is almost no sense of a real place";
   from orbit, a moiré over the land; on Earth, snow-white blobs hundreds of
   kilometres across, Amazonia included.
2. "Different kinds of landscape drawn differently, not just different textures
   over the same voxels."
3. "A better ontology of clouds — now, especially from above, you can see it is
   just lots and lots of bits of cotton wool; it looks nothing like real cloud
   structures."
4. If room is left: an optimised look between plain and full, on the same
   switch, that loses no quality and does not look "drunk".

The lead's decisions, each with its reason, are in
`docs/plans/island-beauty.paused.md` § "Design decisions". Read that section;
the rest of the plan is the lead's.

## House rules that are not negotiable

- **Write in English** — code, comments, commits, notes, and your own session's
  replies. If the operator asks you something in Russian, answer that in Russian
  and go back to English.
- **Never open a pull request, never merge to `main`, never use an outside
  service.** Work on your own branch and push it.
- **Push every step that passes**, and a `wip:` commit every few files: the
  container can restart, and the weekly limit can stop the whole team at any
  moment. What is not pushed does not exist.
- **Never `git pull`.** Take the lead's branch with
  `git fetch origin claude/island-beauty-c1rj3b && git merge origin/claude/island-beauty-c1rj3b`.
- **Read `CLAUDE.md` § "Key principles" as binding**: no lint-suppression
  comments, no `as any`, no file over 400 lines, comments state the code's
  lasting contract and never the change, files are read and edited with the
  Read/Edit/Write tools. `src/` follows MASD (`.claude/rules/masd.md` loads when
  you read a file under it); a new slice or sub-slice is a last resort.
- **Stay inside the files your brief grants.** Something you need changed
  outside them goes into your report; the lead owns what crosses packages.
- **Stop and report at the first design rule you cannot keep**, with the options
  measured. Do not quietly trade one of the operator's asks for another.

## Gates before you report a step as done

Run on your own diff, each as its own call (never `pnpm lint`, which rewrites
the world; never the full `./scripts/vet.sh`, which is the lead's):

- `pnpm typecheck`, `pnpm lint:check`, `pnpm format:check`, `pnpm knip`,
  `pnpm type-overlap`
- `pnpm check:masd`, `pnpm lint:fsd`, `pnpm check:cycles` when you added or
  moved a file
- `pnpm test <path/to/x.test.ts>` for the tests beside what you changed; a pure
  function you add gets a test beside it (`node:test`, `node:assert/strict`)
- before your final report, `/dry` and `/tend-prose` over your own diff

## Looking at what you drew

Judging a look by reading shader code does not work; shoot it.
`pnpm shoot:island` (`src/island/scripts/shoot-island.ts`) takes stills of
either look at any place, height, heading and hour, on WebGPU under software
raster. Its `--help` has the flags; the `beauty` set is the run's fixed
before/after sequence. It is slow (seconds per frame, a build first), so one
browser at a time and one foreground call per run. Look at your frames yourself
with `Read`, and say in your report what is still wrong in them.

## The board and the timelapse are the keeper's

A separate session keeps the island board and the timelapse. Every frame worth
showing — a milestone and a failure alike — goes to it the turn it exists:
commit the JPEG under `docs/remove-before-merging/island-beauty-c1rj3b/frames/`
on your branch, push, and tell the keeper (its session id is in your brief) the
branch, the file names, and one sentence per frame saying what it shows and what
is wrong with it. Never edit `src/island-board/` yourself.

## Reporting

End each landed step with one `send_message` to the lead's session
(`session_01DaohkBiucpraEhsFyZ58M9`): your branch and head SHA, what is built
and wired into the page, what is left, the gates' results, what you need changed
outside your files, and every place you departed from a decision in the plan.
Then keep going with the next step in your brief; you do not wait for a reply.

If your context grows long, the session compacts by itself: keep a short
hand-over note current at
`docs/remove-before-merging/island-beauty-c1rj3b/notes/<your-package>.md` on
your branch — what is decided, what is measured, what is next — so you find your
place afterwards.

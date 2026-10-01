# step0-cruise — hand-over note

Package: step 0, the pace half — `model/cruise.ts`, `model/pan.ts` (optional
ends, explicit cruise), `model/stride.ts`, and their tests.

## Done

- Step 1: `cruise.ts` + `cruise.test.ts`; `pan.ts` drives its keys through
  `cruise`, and a pan with a `turn` (`turnOf(focal)`) is a heading — no ends,
  wraps once round, cruises at `TURN_CRUISE`. `pan.test.ts` untouched, 30/30
  before and after. `Cruised`/`Paced` are the shared bases the type-overlap
  gate asked for; `scripts/lib/play-pan-keys.ts`'s `Turning` takes `Cruised`.

## Left

- Step 2: `stride.ts` + test.

## Decided

- The heading-crop tests live in `cruise.test.ts`, `pan.test.ts` being frozen.

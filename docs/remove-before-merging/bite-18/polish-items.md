# Bite 18 — items for the tail's `/dry`

Named by the build agents, left for the polish wave:

1. `model/keeping.ts`'s `UNKEPT` repeats `game.ts`'s private `PICKERS_SHUT`;
   export `PICKERS_SHUT` (or a `shutPickers` helper) from `game.ts` and
   build `UNKEPT` on it.
2. `model/keeping.ts` and `model/flier-rest.ts` import each other
   (`RESTED_AT` one way, `restedFliers` the other); move `RESTED_AT` to the
   module both can stand on.

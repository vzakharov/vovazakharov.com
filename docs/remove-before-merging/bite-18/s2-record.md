# S2 — the record and the hash (hand-over)

Done, one step: the pure record and the hash rule.

- `model/kept-record.ts` — `export const KEPT_VERSION = 1` (the `Kept`
  type's `version` is `typeof KEPT_VERSION`); a module-private `KeptSchema
= z.object({…}) satisfies z.ZodType<Kept>`, every enum from the model's
  own arrays; `readKept(raw: unknown): Kept | undefined`.
- `model/meadow-number.ts` — `type MeadowChoice = { number: number; fresh:
boolean }`, `meadowNumber(hash: string, kept: readonly number[]):
MeadowChoice`, `meadowHash(number: number): string` (`#n`).
- `model/house.ts` exports `WINDOW_KINDS`, `model/flight.ts` `PERCH_KINDS`
  (one word each, `flight.ts` net 0).
- Tests beside both.

Decided here:

- `KeptSchema` is not exported: `readKept` is its one reader, and knip
  fails an export nothing imports.
- The hash to write is `meadowHash(number)`, not a field of `MeadowChoice`:
  a `hash: string` member collides under `pnpm type-overlap` with
  `scripts/render-mermaid.ts`'s `Fence`, which is off limits.
- `#n` is a positive integer with no leading zero and within
  `Number.MAX_SAFE_INTEGER`; `#01`, `#1.5`, `#-2`, `#NEW` and an oversized
  number read as "anything else" (the highest kept, or a fresh 1).
- A key the model types as `T | undefined` (non-optional) is
  `z.union([T, z.undefined()])`; `.optional()` only where the model's key is
  optional.
- Perches: a `discriminatedUnion` whose `kind`s are
  `z.enum(PERCH_KINDS).extract([...])`; fliers: `INSECT_KINDS` with
  `exclude(['bee'])` / `extract(['bee'])`. `Lean` has no const array, so it
  is `z.literal([-1, 1])`.
- `kept` passed to `meadowNumber` is every number in the store, readable or
  not; the "beside" rule for an unreadable record is S4's.

Left: nothing for S2.

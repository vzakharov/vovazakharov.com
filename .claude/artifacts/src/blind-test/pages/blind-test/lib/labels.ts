import type { Variant } from "#src/blind-test/shared/blind-set/index.ts";

// Letters, so a master is never read as a song's number; the files keep 1, 2…
const LETTERS = "ABCDEFGH";
// The key each letter sits on in the Russian layout, so a switch works in either.
const RUSSIAN_KEYS = "фисвуапр";

export function variantLabel(variant: Variant, mix: string): string {
  return variant === "mix" ? mix : (LETTERS[Number(variant) - 1] ?? variant);
}

/** Each key that selects a variant, in both layouts: M for the mix, A, B… for the masters. */
export function variantKeys(list: readonly Variant[]): Map<string, Variant> {
  return new Map(
    list.flatMap((variant): [string, Variant][] => {
      if (variant === "mix") {
        return [
          ["m", variant],
          ["ь", variant],
        ];
      }
      const index = Number(variant) - 1;
      const latin = LETTERS[index]?.toLowerCase();
      const russian = RUSSIAN_KEYS[index];
      return latin === undefined || russian === undefined
        ? []
        : [
            [latin, variant],
            [russian, variant],
          ];
    }),
  );
}

export function clock(seconds: number): string {
  const whole = Math.floor(seconds);
  return `${String(Math.floor(whole / 60))}:${String(whole % 60).padStart(2, "0")}`;
}

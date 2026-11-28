import * as z from "zod/mini";

/** One song under test, `id` naming its directory of `mix.mp3`, `1.mp3`… */
const pieceSchema = z.object({
  id: z.string().check(z.regex(/^[a-z0-9-]+$/)),
  title: z.string(),
  /** How many masters it has, the number `blind-abc.py build` was given. */
  masters: z.int().check(z.positive()),
});

const blindSetSchema = z.object({
  title: z.string(),
  pieces: z.array(pieceSchema).check(z.minLength(1)),
});

export type BlindPiece = z.infer<typeof pieceSchema>;
export type BlindSet = z.infer<typeof blindSetSchema>;

/** A position `blind-abc.py split` writes: the unmastered mix, or a master's number from 1. */
export type Variant = "mix" | `${number}`;

export function parseBlindSet(value: unknown): BlindSet {
  return blindSetSchema.parse(value);
}

export function variants({ masters }: BlindPiece): readonly Variant[] {
  return [
    "mix",
    ...Array.from({ length: masters }, (_, index) => `${index + 1}` as const),
  ];
}

/** Where a variant is published beside the page, relative to it. */
export function audioPath(piece: BlindPiece, variant: Variant): string {
  return `audio/${piece.id}/${variant}.mp3`;
}

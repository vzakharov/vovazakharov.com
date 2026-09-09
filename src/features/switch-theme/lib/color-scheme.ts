import type { MantineColorScheme } from '@mantine/core';

/** The two schemes the toggle shows; `auto` is the absence of a pick. */
export type PickedColorScheme = Exclude<MantineColorScheme, 'auto'>;

/**
 * A pick equal to the reader's system setting is not a preference — `auto` is
 * the same paint with none of the stickiness. Called on a click and nowhere
 * else, so a stored preference outlives the reader's own system changing.
 */
export function preferredColorScheme(
  picked: PickedColorScheme,
  system: PickedColorScheme,
): MantineColorScheme {
  return picked === system ? 'auto' : picked;
}

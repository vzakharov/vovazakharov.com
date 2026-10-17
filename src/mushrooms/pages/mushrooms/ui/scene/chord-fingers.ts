/**
 * Which of a touch's `changed` fingers, by identifier, play a chord: every
 * one but the finger Phaser's one touch pointer holds (`held`, `undefined`
 * while it holds none), which Phaser answers as an ordinary tap. Phaser gives
 * a landing finger that pointer whenever it is free, so after the first
 * finger lifts, the next to land is Phaser's even while another is down.
 */
export function chordFingers(
  changed: readonly number[],
  held: number | undefined,
): number[] {
  return changed.filter((id) => id !== held);
}

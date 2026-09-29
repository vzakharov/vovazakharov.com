/**
 * Which of a touch's `changed` fingers, by identifier, play a chord: every
 * one when a finger was already `down` before them, and every one but the
 * first otherwise, the first being the finger Phaser takes as its one.
 */
export function chordFingers(
  changed: readonly number[],
  down: readonly number[],
): number[] {
  const earlier = down.some((id) => !changed.includes(id));
  return earlier ? [...changed] : changed.slice(1);
}

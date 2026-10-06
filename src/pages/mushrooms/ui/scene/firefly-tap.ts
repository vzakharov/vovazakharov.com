import type { Point } from '../../model/geometry';
import { tappedInsect, type TapTarget } from './insect-tap';

/**
 * Which of `targets`, the fireflies as a tap finds them, a tap at `finger`
 * goes to: the nearest whose reach holds it (`tappedInsect`), and only where
 * `underOther` says nothing else under the finger answers — so a firefly is
 * easy to catch in the open and never costs the child the door, cap or
 * window it circles. `undefined` where none takes it.
 */
export function tappedFirefly(
  finger: Point,
  targets: readonly TapTarget[],
  underOther: () => boolean,
): string | undefined {
  const reached = tappedInsect(finger, targets);
  return reached === undefined || underOther() ? undefined : reached;
}

'use client';

import type { Looking } from '@/island/shared/play';

import COPY from '../config/messages/en.json';
import classes from './island.module.scss';

type LookButtonProps = Looking & {
  /** Steps to the next look, as B does. */
  readonly onStep: () => void;
};

/**
 * The look by name, a tap stepping it as B does: how a touch screen, which has
 * no B, reaches the swift and fine looks. A sibling of the canvas, so a tap on
 * it never reaches the eye's gestures.
 */
export function LookButton({ look, onStep }: LookButtonProps) {
  const { label, names } = COPY.looks;
  return (
    <button
      type="button"
      className={classes['lookButton']}
      aria-label={`${label}: ${names[look]}`}
      onClick={onStep}
    >
      {names[look]}
    </button>
  );
}

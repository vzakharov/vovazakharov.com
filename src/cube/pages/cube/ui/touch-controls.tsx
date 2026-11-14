import { useEffect, useState } from 'react';

import { cx } from '@/kernel/shared/lib/class-names';

import type COPY from '../config/messages/en.json';
import classes from './cube.module.scss';

type TouchControlsProps = {
  copy: (typeof COPY)['controls'];
  /** Hears that the overlay has faded out, its while over. */
  onShown: () => void;
};

/**
 * What each part of a touch screen does, laid over the canvas until a finger
 * first drags — however long the waking takes before the body can move — and
 * then fading: the left half walks, the right half looks, a tap uses. It lets
 * every touch through to the canvas under it.
 */
export function TouchControls({ copy, onShown }: TouchControlsProps) {
  const [dragged, setDragged] = useState(false);
  useEffect(() => {
    const onMove = ({ pointerType, buttons }: PointerEvent) => {
      if (pointerType === 'touch' && buttons !== 0) setDragged(true);
    };
    globalThis.addEventListener('pointermove', onMove);
    return () => {
      globalThis.removeEventListener('pointermove', onMove);
    };
  }, []);
  return (
    <div
      className={cx(classes['controls'], dragged && classes['controlsGone'])}
      aria-hidden
      onAnimationEnd={onShown}
    >
      <div className={classes['controlsHalf']}>
        <span className={classes['controlsStick']} />
        {copy.walk}
      </div>
      <div className={classes['controlsHalf']}>
        <span className={classes['controlsLook']} />
        {copy.look}
      </div>
      <p className={classes['controlsUse']}>{copy.use}</p>
    </div>
  );
}

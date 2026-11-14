import type COPY from '../config/messages/en.json';
import classes from './cube.module.scss';

type TouchControlsProps = {
  copy: (typeof COPY)['controls'];
  /** Hears that the overlay has faded out, its while over. */
  onShown: () => void;
};

/**
 * What each part of a touch screen does, laid over the canvas for a while as
 * the fingers find it: the left half walks, the right half looks, a tap uses.
 * It lets every touch through to the canvas under it.
 */
export function TouchControls({ copy, onShown }: TouchControlsProps) {
  return (
    <div className={classes['controls']} aria-hidden onAnimationEnd={onShown}>
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

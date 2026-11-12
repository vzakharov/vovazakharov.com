'use client';

import { useEffect, useState } from 'react';

import classes from './cube.module.scss';

/** The key that shows and hides the meter, by physical position. */
const TOGGLE = 'KeyF';

/** How long the meter averages over before it shows a new reading, in ms. */
const WINDOW = 500;

type Reading = { fps: number; ms: number };

/**
 * The frames the browser draws each second, and the mean time between them,
 * shown in a corner once `F` is pressed and gone on the next press. It counts
 * animation frames, which the cube draws one of each, and runs only while
 * shown.
 */
export function FrameRate() {
  const [shown, setShown] = useState(false);
  const [reading, setReading] = useState<Reading | null>(null);

  useEffect(() => {
    const toggle = ({ code, repeat, ctrlKey, metaKey }: KeyboardEvent) => {
      if (code !== TOGGLE || repeat || ctrlKey || metaKey) return;
      setShown((was) => !was);
      setReading(null);
    };
    globalThis.addEventListener('keydown', toggle);
    return () => {
      globalThis.removeEventListener('keydown', toggle);
    };
  }, []);

  useEffect(() => {
    if (!shown) return;
    let frame = 0;
    let since = performance.now();
    let frames = 0;
    const tick = (time: number) => {
      frames += 1;
      const spent = time - since;
      if (spent >= WINDOW) {
        setReading({ fps: (frames * 1000) / spent, ms: spent / frames });
        since = time;
        frames = 0;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [shown]);

  if (!shown) return null;
  return (
    <p className={classes['frameRate']}>
      {reading === null
        ? '…'
        : `${reading.fps.toFixed(0)} fps · ${reading.ms.toFixed(1)} ms`}
    </p>
  );
}

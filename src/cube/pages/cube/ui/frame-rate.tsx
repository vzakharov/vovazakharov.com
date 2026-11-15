'use client';

import { useEffect, useState } from 'react';

import classes from './cube.module.scss';
import { type PassTimes, type Timed, timesLine } from './pass-timer';

/** The key that shows and hides the meter, by physical position. */
const TOGGLE = 'KeyF';

/** How long the meter averages over before it shows a new reading, in ms. */
const WINDOW = 500;

/** Frames a second, the mean milliseconds between them, and the GPU's stages. */
type Reading = { fps: number; interval: number; gpu: PassTimes | null };

/** One reading as the meter shows it, a line for the GPU's stages under it. */
const readingLines = ({ fps, interval, gpu }: Reading): string => {
  const frame = `${fps.toFixed(0)} fps · ${interval.toFixed(1)} ms`;
  return gpu === null ? frame : `${frame}\n${timesLine(gpu)}`;
};

/**
 * The frames the browser draws each second, the mean time between them and,
 * where the GPU can time its passes, how long each stage of a frame takes
 * there, shown in a corner once `F` is pressed and gone on the next press. It
 * counts animation frames, which the cube draws one of each, and runs, the
 * GPU's timer with it, only while shown.
 */
export function FrameRate({ passTimes, timing }: Timed) {
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
    timing(true);
    const tick = (time: number) => {
      frames += 1;
      const spent = time - since;
      if (spent >= WINDOW) {
        setReading({
          fps: (frames * 1000) / spent,
          interval: spent / frames,
          gpu: passTimes(),
        });
        since = time;
        frames = 0;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      timing(false);
    };
  }, [shown, passTimes, timing]);

  if (!shown) return null;
  return (
    <p className={classes['frameRate']}>
      {reading === null ? '…' : readingLines(reading)}
    </p>
  );
}

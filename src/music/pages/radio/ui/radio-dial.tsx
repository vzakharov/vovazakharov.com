'use client';

import { Box } from '@mantine/core';
import { useState } from 'react';

import type { Timed } from '@/kernel/shared/typings';

import { formatDuration } from '@/music/shared/lib/duration';

import classes from './radio.module.scss';

/** A short tick every quarter of a minute, a long one on the minute. */
const TICK_SECONDS = 15;

/** A long tick, and the only ones the marks under the scale number. */
const onMinute = (second: number) => second % 60 === 0;

/** The song's length, which the scale spans, and how far into it the station is now. */
type DialProps = Timed & { into: number };

/**
 * The needle, gliding across the scale on one CSS animation as long as the
 * song, started `into` seconds in. Its start is held from the first render, as
 * a running animation counts from when it began: the slot's key remounts it.
 */
function Needle({ seconds, into }: DialProps) {
  const [startAt] = useState(into);

  return (
    <Box
      className={classes['travel']}
      style={{
        '--song': `${String(seconds)}s`,
        '--at': `${String(-startAt)}s`,
      }}
    >
      <div className={classes['needle']} />
    </Box>
  );
}

/**
 * The song drawn as a tuning scale, its needle where the station is, and the
 * counter under it — the only thing a timer updates.
 */
export function RadioDial({ seconds, into }: DialProps) {
  const ticks = Array.from(
    { length: Math.floor(seconds / TICK_SECONDS) + 1 },
    (_, index) => index * TICK_SECONDS,
  );
  const position = (second: number) => ({
    left: `${String((second / seconds) * 100)}%`,
  });

  return (
    <div>
      <div className={classes['scale']} aria-hidden>
        <div className={classes['base']} />
        {ticks.map((second) => (
          <i
            key={second}
            className={
              onMinute(second) ? classes['majorTick'] : classes['tick']
            }
            style={position(second)}
          />
        ))}
        <Needle {...{ seconds, into }} />
      </div>
      <div className={classes['marks']} aria-hidden>
        {ticks
          .filter((second) => onMinute(second))
          .map((second) => (
            <span key={second} style={position(second)}>
              {second / 60}
            </span>
          ))}
      </div>
      <div className={classes['times']}>
        {formatDuration(into)} / {formatDuration(seconds)}
      </div>
    </div>
  );
}

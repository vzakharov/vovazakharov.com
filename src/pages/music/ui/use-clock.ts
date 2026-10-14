'use client';

import { useEffect, useState } from 'react';

/**
 * The device's clock, ticking on each whole second — when a slot boundary or
 * the counter's next second falls. Undefined until mount, a build not knowing
 * the hour it will be read at.
 */
export function useClock(): number | undefined {
  const [now, setNow] = useState<number>();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      setNow(Date.now());
      timer = setTimeout(tick, 1000 - (Date.now() % 1000));
    };

    timer = setTimeout(tick, 0);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return now;
}

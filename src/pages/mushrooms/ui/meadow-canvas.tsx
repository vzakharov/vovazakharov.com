'use client';

import { useEffect, useRef } from 'react';

import classes from './mushrooms.module.scss';

/**
 * The element the game fills. Phaser is imported here, after mount, so it
 * reaches this route's client bundle alone and never the server render.
 */
export function MeadowCanvas() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = host.current;
    if (!parent) return;
    let stop: (() => void) | undefined;
    let unmounted = false;
    void import('./scene/start-game').then(({ startGame }) => {
      if (!unmounted) stop = startGame(parent);
    });
    return () => {
      unmounted = true;
      stop?.();
    };
  }, []);

  return <div ref={host} className={classes['meadow']} />;
}

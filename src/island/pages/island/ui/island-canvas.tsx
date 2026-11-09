'use client';

import { useEffect, useRef, useState } from 'react';

import type { Labeled } from '@/kernel/shared/typings';

import { PLAY_QUERY } from '@/island/shared/play';

import { worldOfHash } from '../lib/world-hash';
import classes from './island.module.scss';
import { mountIslandScene } from './island-scene';
import { installPlayHook } from './play-hook';

/** The canvas the island's scene draws into, filling the viewport. */
export function IslandCanvas({ label }: Labeled) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failure, setFailure] = useState<Error | null>(null);
  // Thrown while rendering, so the route's error boundary shows it.
  if (failure !== null) throw failure;

  useEffect(() => {
    const element = canvasRef.current;
    if (element === null) return;
    const play = new URLSearchParams(globalThis.location.search).has(
      PLAY_QUERY,
    );
    const hashWorld = () => worldOfHash(globalThis.location.hash);
    const scene = mountIslandScene(element, {
      world: hashWorld(),
      play,
      onError: setFailure,
    });
    const onHashChange = () => {
      scene.setWorld(hashWorld());
    };
    globalThis.addEventListener('hashchange', onHashChange);
    const uninstall = play ? installPlayHook(scene) : null;
    return () => {
      globalThis.removeEventListener('hashchange', onHashChange);
      uninstall?.();
      scene.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={classes['island']}
      aria-label={label}
      tabIndex={0}
    />
  );
}

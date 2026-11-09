'use client';

import { useEffect, useRef, useState } from 'react';

import type { Labeled } from '@/kernel/shared/typings';

import { PLAY_QUERY } from '@/island/shared/play';

import COPY from '../config/messages/en.json';
import { parsePlace } from '../lib/place-hash';
import classes from './island.module.scss';
import { mountIslandScene } from './island-scene';
import { installPlayHook } from './play-hook';
import { type Copied, installWhere } from './where';

/** How long the where-line's confirmation stays up. */
const CONFIRM_MS = 1800;

/** The canvas the island's scene draws into, filling the viewport. */
export function IslandCanvas({ label }: Labeled) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failure, setFailure] = useState<Error | null>(null);
  // Each copy is a fresh object, so a second `P` restarts the confirmation.
  const [copied, setCopied] = useState<Copied | null>(null);
  // Thrown while rendering, so the route's error boundary shows it.
  if (failure !== null) throw failure;

  useEffect(() => {
    const element = canvasRef.current;
    if (element === null) return;
    const play = new URLSearchParams(globalThis.location.search).has(
      PLAY_QUERY,
    );
    const hashPlace = () => parsePlace(globalThis.location.hash);
    const { world, pose } = hashPlace();
    const scene = mountIslandScene(element, {
      world,
      pose,
      play,
      onError: setFailure,
    });
    const onHashChange = () => {
      const next = hashPlace();
      scene.setWorld(next.world);
      if (next.pose !== undefined) scene.placeAt(next.pose);
    };
    globalThis.addEventListener('hashchange', onHashChange);
    const uninstallWhere = installWhere(scene, element, setCopied);
    const uninstallPlay = play ? installPlayHook(scene) : null;
    return () => {
      globalThis.removeEventListener('hashchange', onHashChange);
      uninstallWhere();
      uninstallPlay?.();
      scene.dispose();
    };
  }, []);

  useEffect(() => {
    if (copied === null) return;
    const hide = setTimeout(() => {
      setCopied(null);
    }, CONFIRM_MS);
    return () => {
      clearTimeout(hide);
    };
  }, [copied]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={classes['island']}
        aria-label={label}
        tabIndex={0}
      />
      <output className={classes['where']} aria-live="polite">
        {copied === null
          ? null
          : copied.ok
            ? COPY.where.copied
            : `${COPY.where.failed} (${copied.error.message})`}
      </output>
    </>
  );
}

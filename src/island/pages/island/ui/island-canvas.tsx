'use client';

import { useEffect, useRef, useState } from 'react';

import type { Labeled } from '@/kernel/shared/typings';

import { PLAY_QUERY } from '@/island/shared/play';
import {
  type HintShowing,
  LOOK_HINT_FADE_SECONDS,
  LOOK_HINT_LIT_SECONDS,
} from '@/island/features/eye';

import COPY from '../config/messages/en.json';
import { parsePlace } from '../lib/place-hash';
import { installDiagnostics, type Panel } from './diagnostics';
import { DiagnosticsPanel } from './diagnostics-panel';
import classes from './island.module.scss';
import { mountIslandScene } from './island-scene';
import { installPlayHook } from './play-hook';

/** The canvas the island's scene draws into, filling the viewport. */
export function IslandCanvas({ label }: Labeled) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failure, setFailure] = useState<Error | null>(null);
  const [hint, setHint] = useState<HintShowing | undefined>();
  const [panel, setPanel] = useState<Panel | null>(null);
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
      onLookHint: setHint,
    });
    const onHashChange = () => {
      const next = hashPlace();
      scene.setWorld(next.world);
      if (next.pose !== undefined) scene.placeAt(next.pose);
    };
    globalThis.addEventListener('hashchange', onHashChange);
    const uninstallDiagnostics = installDiagnostics(scene, element, setPanel);
    const uninstallPlay = play ? installPlayHook(scene) : null;
    return () => {
      globalThis.removeEventListener('hashchange', onHashChange);
      uninstallDiagnostics();
      uninstallPlay?.();
      scene.dispose();
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={classes['island']}
        aria-label={label}
        tabIndex={0}
      />
      <output className={classes['lookHint']} aria-live="polite">
        {hint === undefined ? null : (
          // Keyed by the showing, so each one starts its fade afresh.
          <span
            key={hint.since}
            className={classes['lookHintShown']}
            style={{
              animationDelay: `${String(LOOK_HINT_LIT_SECONDS)}s`,
              animationDuration: `${String(LOOK_HINT_FADE_SECONDS)}s`,
            }}
          >
            <span className={classes['hintKeys']}>
              {COPY.look[hint.hint].keys}
            </span>
            <span className={classes['hintTouch']}>
              {COPY.look[hint.hint].touch}
            </span>
          </span>
        )}
      </output>
      {panel === null ? null : <DiagnosticsPanel {...panel} />}
    </>
  );
}

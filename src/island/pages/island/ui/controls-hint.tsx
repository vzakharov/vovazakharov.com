'use client';

import { useEffect, useState } from 'react';

import { PLAY_QUERY } from '@/island/shared/play';

import { COPY } from '../config/i18n';
import classes from './island.module.scss';

/** How long after the page opens the hint comes in. */
const APPEAR_MS = 800;

/** How long the hint stays after the player first touches the controls. */
const LINGER_MS = 4000;

type Phase = 'waiting' | 'shown' | 'fading' | 'gone';

type Row = { readonly keys: string; readonly does: string };

const rows = (list: readonly Row[], className: string | undefined) => (
  <dl {...{ className }}>
    {list.map(({ keys, does }) => (
      <div key={keys} className={classes['hintRow']}>
        <dt>{keys}</dt>
        <dd>{does}</dd>
      </div>
    ))}
  </dl>
);

/**
 * The controls over the scene — keys and mouse, or gestures on a touch screen
 * (the stylesheet picks). Never shown under play, whose frames must not carry
 * it.
 */
export function ControlsHint() {
  const [phase, setPhase] = useState<Phase>('waiting');

  useEffect(() => {
    if (new URLSearchParams(globalThis.location.search).has(PLAY_QUERY)) {
      return;
    }
    const appear = setTimeout(() => {
      setPhase((now) => (now === 'waiting' ? 'shown' : now));
    }, APPEAR_MS);
    let linger: ReturnType<typeof setTimeout> | undefined;
    // Only the first use counts; the ones after it find the fade under way.
    const onUse = () => {
      linger ??= setTimeout(() => {
        setPhase((now) => (now === 'gone' ? now : 'fading'));
      }, LINGER_MS);
    };
    globalThis.addEventListener('keydown', onUse);
    globalThis.addEventListener('pointerdown', onUse);
    globalThis.addEventListener('wheel', onUse, { passive: true });
    return () => {
      clearTimeout(appear);
      clearTimeout(linger);
      globalThis.removeEventListener('keydown', onUse);
      globalThis.removeEventListener('pointerdown', onUse);
      globalThis.removeEventListener('wheel', onUse);
    };
  }, []);

  if (phase === 'waiting' || phase === 'gone') return null;

  const { hint } = COPY;
  return (
    <aside
      className={classes['hint']}
      data-fading={phase === 'fading' || undefined}
      aria-label={hint.label}
      onTransitionEnd={() => {
        setPhase('gone');
      }}
    >
      {rows(hint.keys, classes['hintKeys'])}
      {rows(hint.touch, classes['hintTouch'])}
      <button
        type="button"
        className={classes['hintClose']}
        aria-label={hint.close}
        onClick={() => {
          setPhase('gone');
        }}
      >
        ×
      </button>
    </aside>
  );
}

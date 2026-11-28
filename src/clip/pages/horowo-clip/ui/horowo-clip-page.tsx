'use client';

import { useEffect, useRef } from 'react';

import COPY from '../config/messages/en.json';
import { readMode } from '../lib/stage-fit';
import styles from './horowo-clip.module.scss';
import { mountPlayer } from './player';
import { SHOTS } from './shots';

/** «Хорошо!», drawn in code and played against the song. */
export function HorowoClipPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    return mountPlayer(
      canvasRef.current,
      readMode(globalThis.location.search),
      SHOTS,
    );
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className={styles['stage']}
      aria-label={COPY.stage}
    />
  );
}

'use client';

import { useEffect, useRef } from 'react';

import type { WithAudio } from '@/kernel/shared/typings';

import COPY from '../config/messages/en.json';
import { readMode } from '../lib/stage-fit';
import styles from './horowo-clip.module.scss';
import { mountPlayer } from './player';
import { SHOTS } from './shots';

/** The canvas the clip plays on, against the song at `audio`. */
export function ClipStage({ audio }: WithAudio) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    return mountPlayer(
      canvasRef.current,
      readMode(globalThis.location.search),
      SHOTS,
      audio,
    );
  }, [audio]);
  return (
    <canvas
      ref={canvasRef}
      className={styles['stage']}
      aria-label={COPY.stage}
    />
  );
}

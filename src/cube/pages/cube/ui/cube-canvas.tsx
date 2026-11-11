'use client';

import { useEffect, useRef, useState } from 'react';

import type { Pose } from '@/cube/entities/world';
import { bindInput, plantedWalls, step } from '@/cube/features/player';

import { type CubePlayHook, PLAY_HOOK, PLAY_QUERY } from '../lib/play';
import classes from './cube.module.scss';
import { mountCube } from './cube-scene';

/** Floor 1's one room, the eye at a person's height in its middle. */
const START: Pose = {
  n: 1,
  x: 0n,
  y: 0n,
  u: 0.5,
  v: 0.5,
  eyeAbove: 0.32,
  yaw: 0,
  elevation: 0,
};

type CubeCanvasProps = {
  /** The canvas's accessible name. */
  canvas: string;
  /** The one line shown where the browser has no WebGPU. */
  unsupported: string;
};

/** The canvas the cube draws into, filling the viewport. */
export function CubeCanvas({ canvas: label, unsupported }: CubeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failure, setFailure] = useState<Error | null>(null);
  const [missing, setMissing] = useState(false);
  // Thrown while rendering, so the route's error boundary shows it.
  if (failure !== null) throw failure;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const play = new URLSearchParams(globalThis.location.search).has(
      PLAY_QUERY,
    );
    const input = play ? null : bindInput(canvas);
    const scene = mountCube(canvas, {
      start: START,
      onFrame:
        input === null
          ? (pose) => pose
          : (pose, seconds) => step(pose, input.read(), seconds, plantedWalls),
      onError: setFailure,
      onUnsupported: () => {
        setMissing(true);
      },
    });
    if (play) {
      const { ready, setPose, adapter } = scene;
      const hook: CubePlayHook = { ready, setPose, adapter };
      Object.assign(globalThis, { [PLAY_HOOK]: hook });
    }
    return () => {
      input?.dispose();
      scene.dispose();
    };
  }, []);

  if (missing) return <p className={classes['unsupported']}>{unsupported}</p>;
  return (
    <canvas
      ref={canvasRef}
      className={classes['cube']}
      aria-label={label}
      tabIndex={0}
    />
  );
}

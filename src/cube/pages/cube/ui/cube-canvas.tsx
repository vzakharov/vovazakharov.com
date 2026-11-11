'use client';

import { useEffect, useRef, useState } from 'react';

import { floorsOf, planted, type Pose } from '@/cube/entities/world';
import {
  bindInput,
  EYE_HEIGHT,
  plantedHoled,
  plantedWalls,
  play as playFrame,
  type Player,
  pulledOf,
} from '@/cube/features/player';

import { type CubePlayHook, PLAY_HOOK, PLAY_QUERY } from '../lib/play';
import classes from './cube.module.scss';
import { mountCube } from './cube-scene';

/** The query naming the floor a walk starts on; floor 1 without it. */
const FLOOR_QUERY = 'floor';

/**
 * The north-west room of the floor `?floor=` names, the eye at a person's
 * height in its middle. A floor the planted world lacks throws, so the route's
 * error boundary names it.
 */
function startOf(query: URLSearchParams): Pose {
  const asked = query.get(FLOOR_QUERY);
  const n = asked === null ? 1 : Number(asked);
  const floors = floorsOf(planted);
  if (!Number.isInteger(n) || n < 1 || n > floors) {
    throw new RangeError(`?${FLOOR_QUERY}= takes a floor from 1 to ${floors}`);
  }
  return {
    n,
    x: 0n,
    y: 0n,
    u: 0.5,
    v: 0.5,
    eyeAbove: EYE_HEIGHT,
    scale: 1,
    yaw: 0,
    elevation: 0,
  };
}

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
    const query = new URLSearchParams(globalThis.location.search);
    const play = query.has(PLAY_QUERY);
    // Thrown from the effect, which the route's error boundary catches too.
    const start = startOf(query);
    const input = play ? null : bindInput(canvas, setFailure);
    const holedHere = plantedHoled(setFailure);
    // The pose is the scene's; the rest of the player rides along with it.
    let player: Player = { pose: start, shrinking: null };
    const scene = mountCube(canvas, {
      start,
      onFrame:
        input === null
          ? (pose) => ({ pose, pulled: null })
          : (pose, seconds) => {
              player = playFrame(
                { ...player, pose },
                input.read(),
                seconds,
                plantedWalls,
                holedHere(pose),
              );
              const { pose: moved } = player;
              return { pose: moved, pulled: pulledOf(player) };
            },
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

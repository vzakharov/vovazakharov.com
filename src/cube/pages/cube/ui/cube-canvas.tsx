'use client';

import { useEffect, useRef, useState } from 'react';

import { fillSlots } from '@/kernel/shared/i18n';

import {
  floorsOf,
  planted,
  type Pose,
  type Room,
  roomKey,
  type Signed,
  type SignKind,
  type WallMounted,
} from '@/cube/entities/world';
import {
  bindInput,
  canPress,
  EYE_HEIGHT,
  plantedHoled,
  plantedWalls,
  play as playFrame,
  type Player,
  pulledOf,
  STILL,
} from '@/cube/features/player';

import type COPY from '../config/messages/en.json';
import { type CubePlayHook, PLAY_HOOK, PLAY_QUERY } from '../lib/play';
import classes from './cube.module.scss';
import { type CubeScene, mountCube, type SignOf } from './cube-scene';
import { SaleOffer } from './sale-offer';

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
  /** The floor the eye stands on, `{floor}` its number. */
  floor: string;
  /** A for-sale room's sign, hint and offer. */
  offer: (typeof COPY)['offer'];
};

/** The canvas the cube draws into, filling the viewport. */
export function CubeCanvas({
  canvas: label,
  unsupported,
  floor: floorLine,
  offer: offerCopy,
}: CubeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failure, setFailure] = useState<Error | null>(null);
  const [missing, setMissing] = useState(false);
  // Set every frame, which re-renders only on a new floor or reach: React
  // drops a set to the value the state already holds.
  const [floor, setFloor] = useState<number | null>(null);
  /** The kind of the sign in reach, if one is. */
  const [inReach, setInReach] = useState<SignKind | null>(null);
  /** Whether an offer is open, read by every frame. */
  const offeringRef = useRef(false);
  const [offer, setOffer] = useState<Signed | null>(null);
  /**
   * The rooms bought on this page, each where its sign hung: held for the
   * page's life alone, the purchase being a demo that charges nothing.
   */
  const holdingsRef = useRef(new Map<string, WallMounted>());
  const sceneRef = useRef<CubeScene | null>(null);
  // Thrown while rendering, so the route's error boundary shows it.
  if (failure !== null) throw failure;

  const closeOffer = () => {
    offeringRef.current = false;
    setOffer(null);
  };

  const buy = () => {
    if (offer === null) return;
    const { room, sign } = offer;
    const { at, facing } = sign;
    holdingsRef.current.set(roomKey(room), { at, facing });
    sceneRef.current?.refresh();
    setOffer({ room, sign: { ...sign, kind: 'yours' } });
  };

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
    /** A press the play hook asked for, resolved once a frame reads it. */
    let pressed: PromiseWithResolvers<void> | null = null;

    /** Shows the hint by a sign in reach, and opens its offer on a press. */
    const reach = (pose: Pose, signOf: SignOf, press: boolean): void => {
      const sign = signOf(pose);
      const can = sign !== null && canPress(pose, sign);
      setFloor(pose.n);
      setInReach(can ? sign.kind : null);
      if (!can || !press) return;
      const { n, x, y } = pose;
      const room: Room = { n, x, y };
      offeringRef.current = true;
      setOffer({ room, sign });
      // The offer takes the pointer, so the mouse can reach its buttons.
      if (document.pointerLockElement === canvas) document.exitPointerLock();
    };

    const scene = mountCube(canvas, {
      start,
      copy: offerCopy,
      bought: () => holdingsRef.current,
      onFrame:
        input === null
          ? (pose, _seconds, signOf) => {
              reach(pose, signOf, pressed !== null);
              pressed?.resolve();
              pressed = null;
              return { pose, pulled: null };
            }
          : (pose, seconds, signOf) => {
              // An open offer holds the body still, its keys read and dropped.
              const read = input.read();
              const controls = offeringRef.current ? STILL : read;
              player = playFrame(
                { ...player, pose },
                controls,
                seconds,
                plantedWalls,
                holedHere(pose),
              );
              const { pose: moved, shrinking } = player;
              reach(moved, signOf, controls.pull && shrinking === null);
              return { pose: moved, pulled: pulledOf(player) };
            },
      onError: setFailure,
      onUnsupported: () => {
        setMissing(true);
      },
    });
    sceneRef.current = scene;
    if (play) {
      const { ready, setPose, adapter } = scene;
      const hook: CubePlayHook = {
        ready,
        setPose,
        adapter,
        press: async () => {
          pressed ??= Promise.withResolvers();
          return pressed.promise;
        },
      };
      Object.assign(globalThis, { [PLAY_HOOK]: hook });
    }
    return () => {
      sceneRef.current = null;
      input?.dispose();
      scene.dispose();
    };
  }, [offerCopy]);

  if (missing) return <p className={classes['unsupported']}>{unsupported}</p>;
  return (
    <>
      <canvas
        ref={canvasRef}
        className={classes['cube']}
        aria-label={label}
        tabIndex={0}
      />
      {floor !== null && (
        <p className={classes['floor']} aria-live="polite">
          {fillSlots(floorLine, { floor })}
        </p>
      )}
      <p className={classes['hint']} aria-live="polite">
        {inReach === null || offer !== null
          ? ''
          : inReach === 'yours'
            ? offerCopy.hintYours
            : offerCopy.hint}
      </p>
      <SaleOffer
        {...{ offer }}
        onBuy={buy}
        onClose={closeOffer}
        copy={offerCopy}
      />
    </>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { fillSlots } from '@/kernel/shared/i18n';

import {
  type Address,
  decodeAddress,
  encodeAddress,
  floorsOf,
  planted,
  type Pose,
  type Posed,
  type Room,
  roomKey,
  type Signed,
  type SignKind,
  type SignMount,
} from '@/cube/entities/world';
import {
  arrivedOn,
  bindInput,
  canPress,
  EYE_HEIGHT,
  handsOf,
  isStanding,
  plantedHoled,
  plantedWalls,
  play as playFrame,
  type Player,
  standingAt,
  STILL,
  takenOf,
} from '@/cube/features/player';

import { type Follow, followAddress } from '../lib/fragment';
import {
  type CubePlayHook,
  PLAY_HOOK,
  PLAY_INSTANT,
  PLAY_QUERY,
} from '../lib/play';
import classes from './cube.module.scss';
import type { Selling, SignOf } from './cube-mesh';
import { type CubeScene, mountCube } from './cube-scene';
import { FrameRate } from './frame-rate';
import { hear } from './hearing';
import {
  drawn,
  type PillCopy,
  type PillPrompt,
  pillPromptOf,
} from './pill-prompt';
import { SaleOffer } from './sale-offer';

/**
 * The query naming a floor the walk went to by its number rather than through
 * the holes above it, and starts on.
 */
const CHEAT_QUERY = 'cheated_to';

/**
 * Where a walk starts, the hatch it landed on its floor through, and whether
 * that hatch was earned, so that the walk's address may be written back.
 */
type Start = Posed & { hatch: Address['hatch']; resumable: boolean };

/**
 * Where the page starts. `?cheated_to=` wins over the fragment and starts on
 * that floor with no earned hatch, so nothing is written back; a floor the planted world lacks throws, so the route's error
 * boundary names it. Otherwise a fragment resumes the address it spells,
 * standing at a person's height, or yields null when it leads nowhere; with
 * neither, the walk starts on floor 1.
 */
async function startOf(
  query: URLSearchParams,
  fragment: string,
): Promise<Start | null> {
  const asked = query.get(CHEAT_QUERY);
  if (asked !== null) {
    const n = Number(asked);
    const floors = floorsOf(planted);
    if (!Number.isInteger(n) || n < 1 || n > floors) {
      throw new RangeError(
        `?${CHEAT_QUERY}= takes a floor from 1 to ${floors}`,
      );
    }
    return { pose: arrivedOn(n), hatch: null, resumable: false };
  }
  if (fragment === '') {
    return { pose: arrivedOn(1), hatch: null, resumable: true };
  }
  const address = await decodeAddress(planted, fragment);
  if (address === null) return null;
  const { at, hatch } = address;
  return {
    pose: { ...at, eyeAbove: EYE_HEIGHT, scale: 1 },
    hatch,
    resumable: true,
  };
}

/** Replaces the URL's fragment without adding a history entry. */
const writeFragment = (fragment: string): void => {
  globalThis.history.replaceState(null, '', `#${fragment}`);
};

/**
 * Makes the URL say the walk cheated its way to floor `n`, its fragment
 * dropped: an address is of a floor reached through its holes.
 */
const writeCheat = (n: number): void => {
  globalThis.history.replaceState(null, '', `?${CHEAT_QUERY}=${String(n)}`);
};

/** `open` hears a press on a sign in reach; `offering` whether one is open. */
type Hooks = {
  setFloor: (n: number) => void;
  setFailure: (error: Error) => void;
  setMissing: (missing: boolean) => void;
  setInReach: (kind: SignKind | null) => void;
  setPill: (prompt: PillPrompt | null) => void;
  open: (offer: Signed) => void;
  offering: () => boolean;
};

/**
 * Draws the cube into `canvas` from `start`, walked by the keyboard and
 * pointer, or by the play hook under `?play`; its `dispose` ends the walk.
 */
function walk(
  canvas: HTMLCanvasElement,
  { pose: start, hatch, resumable }: Start,
  play: boolean,
  selling: Selling,
  hooks: Hooks,
): CubeScene {
  const { setFloor, setFailure, setMissing, setInReach, setPill } = hooks;
  const { open, offering } = hooks;
  const input = play ? null : bindInput(canvas, setFailure);
  // A script's walk is looked at, not listened to.
  const hearing = input === null ? null : hear(canvas);
  const holedHere = plantedHoled(setFailure);
  let follow: Follow | null =
    input === null || !resumable
      ? null
      : followAddress(
          start.n,
          hatch,
          async (address) => encodeAddress(planted, address),
          writeFragment,
          setFailure,
        );
  // The pose is the scene's; the rest of the player rides along with it.
  let player: Player = standingAt(start);
  /** A press the play hook asked for, resolved once a frame reads it. */
  let pressed: PromiseWithResolvers<void> | null = null;
  /** The instant a script's clock is stopped at; a walk's clock runs. */
  let frozen: number | null = play ? PLAY_INSTANT : null;

  /** Shows the hint by a sign in reach, and opens its offer on a press. */
  const reach = (pose: Pose, signOf: SignOf, press: boolean): void => {
    const sign = signOf(pose);
    const can = sign !== null && canPress(pose, sign);
    setFloor(pose.n);
    setInReach(can ? sign.kind : null);
    if (!can || !press) return;
    const { n, x, y } = pose;
    const room: Room = { n, x, y };
    open({ room, sign });
    // The offer takes the pointer, so the mouse can reach its buttons.
    if (document.pointerLockElement === canvas) document.exitPointerLock();
  };

  const scene = mountCube(canvas, {
    start,
    ...selling,
    onFrame:
      input === null
        ? (pose, _seconds, signOf) => {
            reach(pose, signOf, pressed !== null);
            pressed?.resolve();
            pressed = null;
            return { pose, taken: null, moving: [] };
          }
        : (pose, seconds, signOf) => {
            // An open offer holds the body still, its keys read and dropped.
            const read = input.read();
            const controls = offering() ? STILL : read;
            const here = holedHere(pose);
            player = playFrame(
              { ...player, pose },
              controls,
              seconds,
              plantedWalls,
              here,
            );
            const { pose: moved, cues } = player;
            hearing?.body(cues, moved);
            const standing = isStanding(player);
            if (controls.goTo === moved.n && moved.n !== pose.n) {
              follow = null;
              writeCheat(moved.n);
            }
            reach(moved, signOf, controls.use && standing);
            setPill(pillPromptOf(player, moved, here));
            follow?.(moved, standing, seconds);
            return {
              pose: moved,
              taken: takenOf(player),
              moving: handsOf(player),
            };
          },
    onHeard: (heard, at) => {
      const now = frozen ?? Date.now();
      hearing?.outside(at, now);
      hearing?.rooms(heard, player.pose, now);
    },
    now: () => frozen ?? Date.now(),
    onError: setFailure,
    onUnsupported: () => {
      setMissing(true);
    },
  });
  if (play) {
    const { ready, setPose, setEye, adapter } = scene;
    const hook: CubePlayHook = {
      ready,
      setPose,
      setEye,
      adapter,
      setClock: (ms) => {
        frozen = ms;
      },
      press: async () => {
        pressed ??= Promise.withResolvers();
        return pressed.promise;
      },
      setPill: drawn(setPill),
    };
    Object.assign(globalThis, { [PLAY_HOOK]: hook });
  }
  return {
    ...scene,
    dispose: () => {
      input?.dispose();
      hearing?.dispose();
      scene.dispose();
    },
  };
}

type CubeCanvasProps = {
  /** The canvas's accessible name. */
  canvas: string;
  /** The one line shown where the browser has no WebGPU. */
  unsupported: string;
  /** The floor the eye stands on, `{floor}` its number. */
  floor: string;
  /** The one line shown when the URL's fragment leads nowhere. */
  nowhere: string;
  /** The lines shown by a pill in reach and by one in the hand. */
  pill: PillCopy;
  /** A for-sale room's sign, hint and offer. */
  offer: Selling['copy'];
};

/** The canvas the cube draws into, filling the viewport. */
export function CubeCanvas({
  canvas: label,
  unsupported,
  floor: floorLine,
  nowhere,
  pill: pillCopy,
  offer: offerCopy,
}: CubeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failure, setFailure] = useState<Error | null>(null);
  const [missing, setMissing] = useState(false);
  const [lost, setLost] = useState(false);
  // Set every frame, which re-renders only on a new floor or reach: React
  // drops a set to the value the state already holds.
  const [floor, setFloor] = useState<number | null>(null);
  /** The kind of the sign in reach, if one is. */
  const [inReach, setInReach] = useState<SignKind | null>(null);
  const [pill, setPill] = useState<PillPrompt | null>(null);
  /** Whether an offer is open, read by every frame. */
  const offeringRef = useRef(false);
  const [offer, setOffer] = useState<Signed | null>(null);
  /**
   * The rooms bought on this page, each where its sign hung: held for the
   * page's life alone, the purchase being a demo that charges nothing.
   */
  const holdingsRef = useRef(new Map<string, SignMount>());
  const sceneRef = useRef<CubeScene | null>(null);
  // Stable, so the meter's window does not restart on every render here.
  const passTimes = useCallback(
    () => sceneRef.current?.passTimes() ?? null,
    [],
  );
  // Thrown while rendering, so the route's error boundary shows it.
  if (failure !== null) throw failure;

  const closeOffer = () => {
    offeringRef.current = false;
    setOffer(null);
  };

  const buy = () => {
    if (offer === null) return;
    const { room, sign } = offer;
    const { at, facing, onPost } = sign;
    holdingsRef.current.set(roomKey(room), { at, facing, onPost });
    sceneRef.current?.refresh();
    setOffer({ room, sign: { ...sign, kind: 'yours' } });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const query = new URLSearchParams(globalThis.location.search);
    let live = true;
    startOf(query, globalThis.location.hash.slice(1))
      .then((start) => {
        if (!live) return;
        if (start === null) {
          setLost(true);
          return;
        }
        sceneRef.current = walk(
          canvas,
          start,
          query.has(PLAY_QUERY),
          { copy: offerCopy, bought: () => holdingsRef.current },
          {
            setFloor,
            setFailure,
            setMissing,
            setInReach,
            setPill,
            open: (signed) => {
              offeringRef.current = true;
              setOffer(signed);
            },
            offering: () => offeringRef.current,
          },
        );
      })
      .catch(setFailure);
    return () => {
      live = false;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [offerCopy]);

  if (lost) return <p className={classes['notice']}>{nowhere}</p>;
  if (missing) return <p className={classes['notice']}>{unsupported}</p>;
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
      <FrameRate {...{ passTimes }} />
      <p className={classes['hint']} aria-live="polite">
        {pill === null
          ? inReach === null || offer !== null
            ? ''
            : inReach === 'yours'
              ? offerCopy.hintYours
              : offerCopy.hint
          : pillCopy[pill]}
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

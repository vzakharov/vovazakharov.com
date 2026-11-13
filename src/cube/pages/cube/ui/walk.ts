import { clockAt } from '@/cube/shared/lib/clock';
import {
  encodeAddress,
  planted,
  type Pose,
  type Quad,
  type Room,
  type Signed,
  type SignKind,
} from '@/cube/entities/world';
import {
  type Abroad,
  abroad,
  asleepOn,
  bindInput,
  canClimb,
  canPress,
  handsAbroad,
  handsOf,
  type Input,
  INTRO_STAGE,
  isPastSill,
  isStanding,
  onSill,
  outsideOf,
  plantedHoled,
  plantedWalls,
  play as playFrame,
  type Player,
  poseWithin,
  shotWithin,
  standingAt,
  standingOf,
  standingWithin,
  steppingOut,
  STILL,
  takenOf,
  whereOf,
} from '@/cube/features/player';

import { adapted, lensAdapted } from '../lib/adaptation';
import { type Follow, followAddress } from '../lib/fragment';
import { lensOf } from '../lib/lit-stage';
import { type CubePlayHook, PLAY_HOOK, PLAY_INSTANT } from '../lib/play';
import { type Start, writeCheat, writeFragment } from '../lib/start';
import type { Selling, SignOf } from './cube-mesh';
import { type CubeScene, mountCube } from './cube-scene';
import { hear } from './hearing';
import { drawn, type PillPrompt, pillPromptOf } from './pill-prompt';

/** What a press of the hand does where the body stands, a sign aside. */
export type Way = 'wake' | 'climb';

/**
 * `open` hears a press on a sign in reach; `offering` whether one is open.
 * `setFloor` takes null out of doors, where no floor is underfoot.
 */
export type Hooks = {
  setFloor: (n: number | null) => void;
  setFailure: (error: Error) => void;
  setMissing: (missing: boolean) => void;
  setInReach: (kind: SignKind | null) => void;
  setWay: (way: Way | null) => void;
  setPill: (prompt: PillPrompt | null) => void;
  open: (offer: Signed) => void;
  offering: () => boolean;
};

/**
 * Draws the cube into `canvas` from `start`, walked by the keyboard and
 * pointer, or by the play hook under `?play`; its `dispose` ends the walk.
 */
export function walk(
  canvas: HTMLCanvasElement,
  { pose: start, hatch, resumable, ashore }: Start,
  play: boolean,
  selling: Selling,
  {
    setFloor,
    setFailure,
    setMissing,
    setInReach,
    setWay,
    setPill,
    open,
    offering,
  }: Hooks,
): CubeScene {
  const input = play ? null : bindInput(canvas, setFailure);
  // A script's walk is looked at, not listened to.
  const hearing = input === null ? null : hear(canvas);
  const holedHere = plantedHoled(setFailure);
  /** The instant a script's clock is stopped at; a walk's clock runs. */
  let frozen: number | null = play ? PLAY_INSTANT : null;
  /** Whether the walk's address may still be written back. */
  let earned = input !== null && resumable;
  const following = (): Follow =>
    followAddress(
      start.n,
      hatch,
      async (address) => encodeAddress(planted, address),
      writeFragment,
      setFailure,
    );
  // A walk that starts on the shore has no address until it climbs in.
  let follow: Follow | null = earned && !ashore ? following() : null;
  const now = (): number => frozen ?? Date.now();
  /** The body while it is out of doors, and what its eye shows there. */
  let out: Abroad | null =
    ashore && input !== null
      ? asleepOn(INTRO_STAGE, clockAt(Date.now()).seconds)
      : null;
  /**
   * Whether the ladder has gone: from the frame the body first comes in by
   * the doorway, and all along for a walk that starts inside.
   */
  let ladderGone = out === null;
  /** How used the eye is to floor 1's lamps: 0 in daylight, 1 by them. */
  let indoors = out === null ? 1 : 0;
  /** The body's hands out of doors, in the frame of floor 1's room. */
  let body: readonly Quad[] = [];
  /** Whether the player has given the sign the sleeper wakes at. */
  let woken = false;
  const wake = (): void => {
    woken = true;
  };
  if (out !== null) {
    globalThis.addEventListener('keydown', wake, { once: true });
    canvas.addEventListener('pointerdown', wake, { once: true });
  }
  // The pose is the scene's; the rest of the player rides along with it.
  let player: Player = standingAt(start);
  /** A press the play hook asked for, resolved once a frame reads it. */
  let pressed: PromiseWithResolvers<void> | null = null;

  /**
   * Shows the hint by a sign in reach, and opens its offer on a press;
   * returns whether a sign is in reach.
   */
  const reach = (pose: Pose, signOf: SignOf, press: boolean): boolean => {
    const sign = signOf(pose);
    const can = sign !== null && canPress(pose, sign);
    setFloor(pose.n);
    setInReach(can ? sign.kind : null);
    if (!can || !press) return can;
    const { n, x, y } = pose;
    const room: Room = { n, x, y };
    open({ room, sign });
    // The offer takes the pointer, so the mouse can reach its buttons.
    if (document.pointerLockElement === canvas) document.exitPointerLock();
    return true;
  };

  /**
   * One frame of `abroad` out of doors, `dt` seconds on: the pose it stands
   * at once a scene has put it inside the cube, null while it is still out.
   */
  const outdoors = (was: Abroad, controls: Input, dt: number): Pose | null => {
    const { seconds } = clockAt(now());
    const next = abroad(was, controls, dt, seconds, INTRO_STAGE, woken);
    const { cues, shot, entered, asleep } = next;
    hearing?.body(cues, outsideOf(shot));
    if (entered) {
      out = null;
      ladderGone = true;
      body = [];
      if (earned) follow ??= following();
      return poseWithin(shot);
    }
    out = next;
    body = handsAbroad(next, INTRO_STAGE);
    setFloor(null);
    setInReach(null);
    setPill(null);
    setWay(
      asleep ? 'wake' : canClimb(next, INTRO_STAGE, seconds) ? 'climb' : null,
    );
    return null;
  };

  /**
   * The frame's share for a body inside at `pose`, `dt` seconds on: floor 1
   * is seen through the lens the eye has got used to, and stands in the sun.
   */
  const indoorsAt = (pose: Pose, dt: number) => {
    indoors = adapted(indoors, pose, dt);
    return pose.n === 1
      ? {
          pose,
          ladderGone,
          lens: lensAdapted(indoors),
          body: standingWithin(pose),
        }
      : { pose, ladderGone };
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
            if (out !== null) {
              const inside = outdoors(out, controls, seconds);
              if (inside === null) {
                const { shot } = out;
                indoors = adapted(indoors, whereOf(shot, INTRO_STAGE), seconds);
                return {
                  pose,
                  taken: null,
                  moving: body,
                  outside: outsideOf(shot),
                  lens: lensAdapted(indoors, lensOf(shot)),
                  ladderGone,
                  body: standingOf(out, INTRO_STAGE),
                };
              }
              player = standingAt(inside);
              return { ...indoorsAt(inside, seconds), taken: null, moving: [] };
            }
            const here = holedHere(pose);
            player = playFrame(
              { ...player, pose },
              controls,
              seconds,
              plantedWalls,
              here,
            );
            // Past the sill there is only the drop to the sand.
            const leaving = isPastSill(player.pose);
            if (leaving) player = { ...player, pose: onSill(player.pose) };
            const { pose: moved, cues } = player;
            hearing?.body(cues, moved);
            const standing = isStanding(player);
            if (controls.goTo === moved.n && moved.n !== pose.n) {
              earned = false;
              follow = null;
              writeCheat(moved.n);
            }
            reach(moved, signOf, controls.use && standing);
            setPill(pillPromptOf(player, moved, here));
            setWay(null);
            if (leaving) {
              out = steppingOut(
                shotWithin(moved),
                moved.scale,
                INTRO_STAGE,
                clockAt(now()).seconds,
              );
            }
            follow?.(moved, standing, seconds);
            return {
              ...indoorsAt(moved, seconds),
              taken: takenOf(player),
              moving: handsOf(player),
            };
          },
    onHeard: (heard, at) => {
      const nowMs = now();
      // A scene's eye is inside from the frame it passes the cube's face.
      hearing?.outside(
        out === null ? at : whereOf(out.shot, INTRO_STAGE),
        nowMs,
      );
      // The rooms are out of earshot of the island.
      if (out === null) hearing?.rooms(heard, player.pose, nowMs);
    },
    now,
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
      setPill: drawn(setPill),
      adapter,
      setClock: (ms) => {
        frozen = ms;
      },
      press: async () => {
        pressed ??= Promise.withResolvers();
        return pressed.promise;
      },
    };
    Object.assign(globalThis, { [PLAY_HOOK]: hook });
  }
  return {
    ...scene,
    dispose: () => {
      input?.dispose();
      globalThis.removeEventListener('keydown', wake);
      canvas.removeEventListener('pointerdown', wake);
      hearing?.dispose();
      scene.dispose();
    },
  };
}

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
  bearingOf,
  bindInput,
  canClimb,
  canLeave,
  canPress,
  handsOf,
  type Input,
  isStanding,
  leaving,
  legsOf,
  outsideOf,
  plantedHoled,
  plantedWalls,
  play as playFrame,
  type Player,
  poseWithin,
  pulledOf,
  shotWithin,
  standingAt,
  STILL,
} from '@/cube/features/player';

import { type Follow, followAddress } from '../lib/fragment';
import { lensOf, LIT_STAGE } from '../lib/lit-stage';
import { type CubePlayHook, PLAY_HOOK, PLAY_INSTANT } from '../lib/play';
import { type Start, writeCheat, writeFragment } from '../lib/start';
import type { Selling, SignOf } from './cube-mesh';
import { type CubeScene, mountCube } from './cube-scene';
import { hear } from './hearing';

/** What a press of the hand does where the body stands, a sign aside. */
export type Way = 'wake' | 'climb' | 'descend';

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
      ? asleepOn(LIT_STAGE, clockAt(Date.now()).seconds)
      : null;
  /** The body's own quads out of doors, in the frame of floor 1's room. */
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
    const next = abroad(was, controls, dt, seconds, LIT_STAGE, woken);
    const { cues, shot, entered, asleep } = next;
    hearing?.body(cues, player.pose);
    if (entered) {
      out = null;
      body = [];
      if (earned) follow ??= following();
      return poseWithin(shot);
    }
    out = next;
    const bearing = bearingOf(next, LIT_STAGE, seconds);
    body = bearing === null ? [] : legsOf(bearing, LIT_STAGE.land);
    setFloor(null);
    setInReach(null);
    setWay(
      asleep ? 'wake' : canClimb(next, LIT_STAGE, seconds) ? 'climb' : null,
    );
    return null;
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
            return { pose, pulled: null, moving: [] };
          }
        : (pose, seconds, signOf) => {
            // An open offer holds the body still, its keys read and dropped.
            const read = input.read();
            const controls = offering() ? STILL : read;
            if (out !== null) {
              const inside = outdoors(out, controls, seconds);
              if (inside === null) {
                const { shot } = out;
                return {
                  pose,
                  pulled: null,
                  moving: body,
                  outside: outsideOf(shot),
                  lens: lensOf(shot),
                };
              }
              player = standingAt(inside);
              return { pose: inside, pulled: null, moving: [] };
            }
            player = playFrame(
              { ...player, pose },
              controls,
              seconds,
              plantedWalls,
              holedHere(pose),
            );
            const { pose: moved, cues } = player;
            hearing?.body(cues, moved);
            const standing = isStanding(player);
            if (controls.goTo === moved.n && moved.n !== pose.n) {
              earned = false;
              follow = null;
              writeCheat(moved.n);
            }
            const press = controls.pull && standing;
            const atSign = reach(moved, signOf, press);
            const leaves = standing && !atSign && canLeave(moved, LIT_STAGE);
            setWay(leaves ? 'descend' : null);
            if (leaves && press) {
              out = leaving(
                shotWithin(moved, LIT_STAGE),
                LIT_STAGE,
                clockAt(now()).seconds,
              );
            }
            follow?.(moved, standing, seconds);
            return {
              pose: moved,
              pulled: pulledOf(player),
              moving: handsOf(player),
            };
          },
    onHeard: (heard) => {
      const nowMs = now();
      hearing?.outside(out === null ? player.pose : outsideOf(out.shot), nowMs);
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

import {
  encodeAddress,
  planted,
  type Pose,
  type Room,
  type Signed,
  type SignKind,
} from '@/cube/entities/world';
import {
  bindInput,
  canPress,
  handsOf,
  isStanding,
  plantedHoled,
  plantedWalls,
  play as playFrame,
  type Player,
  pulledOf,
  standingAt,
  STILL,
} from '@/cube/features/player';

import { type Follow, followAddress } from '../lib/fragment';
import { type CubePlayHook, PLAY_HOOK, PLAY_INSTANT } from '../lib/play';
import { type Start, writeCheat, writeFragment } from '../lib/start';
import type { Selling, SignOf } from './cube-mesh';
import { type CubeScene, mountCube } from './cube-scene';
import { hear } from './hearing';

/** `open` hears a press on a sign in reach; `offering` whether one is open. */
export type Hooks = {
  setFloor: (n: number) => void;
  setFailure: (error: Error) => void;
  setMissing: (missing: boolean) => void;
  setInReach: (kind: SignKind | null) => void;
  open: (offer: Signed) => void;
  offering: () => boolean;
};

/**
 * Draws the cube into `canvas` from `start`, walked by the keyboard and
 * pointer, or by the play hook under `?play`; its `dispose` ends the walk.
 */
export function walk(
  canvas: HTMLCanvasElement,
  { pose: start, hatch, resumable }: Start,
  play: boolean,
  selling: Selling,
  { setFloor, setFailure, setMissing, setInReach, open, offering }: Hooks,
): CubeScene {
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
            return { pose, pulled: null, moving: [] };
          }
        : (pose, seconds, signOf) => {
            // An open offer holds the body still, its keys read and dropped.
            const read = input.read();
            const controls = offering() ? STILL : read;
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
              follow = null;
              writeCheat(moved.n);
            }
            reach(moved, signOf, controls.pull && standing);
            follow?.(moved, standing, seconds);
            return {
              pose: moved,
              pulled: pulledOf(player),
              moving: handsOf(player),
            };
          },
    onHeard: (heard) => {
      hearing?.rooms(heard, player.pose, frozen ?? Date.now());
    },
    now: () => frozen ?? Date.now(),
    onError: setFailure,
    onUnsupported: () => {
      setMissing(true);
    },
  });
  if (play) {
    const { ready, setPose, adapter } = scene;
    const hook: CubePlayHook = {
      ready,
      setPose,
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
      hearing?.dispose();
      scene.dispose();
    },
  };
}

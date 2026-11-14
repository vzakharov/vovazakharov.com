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
  awakeOn,
  bindInput,
  canClimb,
  canPress,
  findsLadderGone,
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
  refusedAt,
  type Said,
  shotWithin,
  standingAt,
  steppingOut,
  STILL,
  takenOf,
  whereOf,
} from '@/cube/features/player';

import { adapted, lensAdapted } from '../lib/adaptation';
import { type Follow, followAddress } from '../lib/fragment';
import { lensOf } from '../lib/lit-stage';
import { type CubePlayHook, PLAY_HOOK, PLAY_INSTANT } from '../lib/play';
import {
  type Start,
  writeAwake,
  writeCheat,
  writeFragment,
} from '../lib/start';
import type { Selling, SignOf } from './cube-mesh';
import { type CubeScene, mountCube } from './cube-scene';
import { hear } from './hearing';
import { drawn, type PillPrompt, pillPromptOf } from './pill-prompt';
import { QUALITY_KEY } from './quality';

/**
 * What a press of the hand does where the body stands, a sign aside, what
 * the body has just found there, or the key that runs.
 */
export type Way = 'wake' | 'climb' | 'gone' | 'run';

/** The scene walked, which a button on screen can answer a question in. */
export type Walk = CubeScene & { answer: (said: Said) => void };

/** From this floor down, the run's key is told `RUN_TOLD_FOR` s a visit. */
const RUN_TOLD_FROM = 3;
const RUN_TOLD_FOR = 6;

/**
 * `open` hears a press on a sign in reach; `offering` whether one is open.
 * `setFloor` takes null out of doors, where no floor is underfoot; `setFree`
 * whether the body answers the controls, neither asleep nor in a scene.
 */
export type Hooks = {
  setFloor: (n: number | null) => void;
  setFailure: (error: Error) => void;
  setMissing: (missing: boolean) => void;
  setInReach: (kind: SignKind | null) => void;
  setWay: (way: Way | null) => void;
  setPill: (prompt: PillPrompt | null) => void;
  setFree: (free: boolean) => void;
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
    setFree,
    open,
    offering,
  }: Hooks,
): Walk {
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
  let follow: Follow | null = earned && ashore === null ? following() : null;
  const now = (): number => frozen ?? Date.now();
  /** The body while it is out of doors, and what its eye shows there. */
  let out: Abroad | null =
    ashore === null || input === null
      ? null
      : (ashore === 'asleep' ? asleepOn : awakeOn)(
          INTRO_STAGE,
          clockAt(Date.now()).seconds,
        );
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
  // The quality's key changes how the scene is drawn, and leaves it asleep.
  const wake = (event: Event): void => {
    if (event instanceof KeyboardEvent && event.code === QUALITY_KEY) return;
    woken = true;
  };
  if (out?.asleep === true) {
    globalThis.addEventListener('keydown', wake);
    canvas.addEventListener('pointerdown', wake, { once: true });
  }
  // The pose is the scene's; the rest of the player rides along with it.
  let player: Player = standingAt(start);
  /**
   * The sill's edge: `unseen` until the body first goes past it and looks
   * for the ladder, `seen` until the keys that took it there are let go,
   * `free` from then, when going past it steps off.
   */
  let sill: 'unseen' | 'seen' | 'free' = 'unseen';
  /** The player as it went to the sill, while it looks for the ladder. */
  let saved: Player | null = null;
  /** A press the play hook asked for, resolved once a frame reads it. */
  let pressed: PromiseWithResolvers<void> | null = null;
  /** Whether a script's eye is out of doors, where no floor is underfoot. */
  let scriptedOut = false;
  /** Seconds the run's key has been told this visit. */
  let runTold = 0;

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
   * One frame of `abroad` out of doors, `dt` seconds on: the player once a
   * scene has put the body inside the cube, null while it is still out. A
   * body back from looking for the ladder is the one that went to the sill,
   * standing where the scene leaves it; one that climbed in stands whole.
   */
  const outdoors = (
    was: Abroad,
    controls: Input,
    dt: number,
  ): Player | null => {
    const { seconds } = clockAt(now());
    const next = abroad(was, controls, dt, seconds, INTRO_STAGE, woken);
    const { cues, shot, entered, asleep } = next;
    hearing?.body(cues, outsideOf(shot));
    if (entered) {
      out = null;
      body = [];
      const inside = poseWithin(shot);
      if (saved !== null) {
        const { u, v, yaw, elevation } = inside;
        const back = {
          ...saved,
          pose: { ...saved.pose, u, v, yaw, elevation },
        };
        saved = null;
        return back;
      }
      ladderGone = true;
      if (earned) follow ??= following();
      return standingAt(inside);
    }
    // The waking is the one scene ending on the island with the ladder up.
    const woke = was.scene !== null && next.scene === null && !next.ladderGone;
    if (woke && earned) writeAwake();
    out = next;
    body = handsAbroad(next, INTRO_STAGE);
    setFloor(null);
    setInReach(null);
    setPill(null);
    setFree(!asleep && next.scene === null);
    setWay(
      asleep
        ? 'wake'
        : findsLadderGone(next)
          ? 'gone'
          : canClimb(next, INTRO_STAGE, seconds)
            ? 'climb'
            : null,
    );
    return null;
  };

  /**
   * The frame for a body inside as `inside`, `dt` seconds on: floor 1 is
   * seen through the lens the eye has got used to.
   */
  const indoorsAt = (inside: Player, dt: number) => {
    const { pose } = inside;
    indoors = adapted(indoors, pose, dt);
    const shown = {
      pose,
      ladderGone,
      taken: takenOf(inside),
      moving: handsOf(inside),
    };
    return pose.n === 1 ? { ...shown, lens: lensAdapted(indoors) } : shown;
  };

  const scene = mountCube(canvas, {
    start,
    ...selling,
    onFrame:
      input === null
        ? (pose, _seconds, signOf) => {
            if (scriptedOut) {
              setFloor(null);
              setInReach(null);
            } else reach(pose, signOf, pressed !== null);
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
                };
              }
              player = inside;
              return indoorsAt(player, seconds);
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
            setFree(true);
            const tellsRun =
              moved.n >= RUN_TOLD_FROM &&
              !input.shifted() &&
              runTold < RUN_TOLD_FOR;
            if (tellsRun) runTold += seconds;
            // The canvas lets a sign's and a pill's hints take the place first.
            setWay(tellsRun ? 'run' : null);
            // A key held through the look is not a second try.
            if (
              sill === 'seen' &&
              controls.walk === 0 &&
              controls.strafe === 0
            ) {
              sill = 'free';
            }
            if (leaving && sill !== 'seen') {
              const edge = shotWithin(moved);
              const at = clockAt(now()).seconds;
              if (sill === 'unseen') {
                saved = player;
                sill = 'seen';
                out = refusedAt(edge, moved.scale, INTRO_STAGE, at);
              } else out = steppingOut(edge, moved.scale, INTRO_STAGE, at);
            }
            follow?.(moved, standing, seconds);
            return indoorsAt(player, seconds);
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
      setPose: async (...set) => {
        scriptedOut = false;
        return setPose(...set);
      },
      setEye: async (...set) => {
        scriptedOut = true;
        return setEye(...set);
      },
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
    answer: (said) => {
      input?.say(said);
    },
    dispose: () => {
      input?.dispose();
      globalThis.removeEventListener('keydown', wake);
      canvas.removeEventListener('pointerdown', wake);
      hearing?.dispose();
      scene.dispose();
    },
  };
}

import { Color, type Scene } from 'three/webgpu';

import type { CanDispose } from '@/kernel/shared/typings';

import { HOUR_SECONDS } from '@/nature/shared/swell';

import { unit, type Vec3 } from '@/island/shared/globe';
import { type Look, nextLook } from '@/island/shared/play';
import { MAX_HEIGHT } from '@/island/features/eye';

import type { Heavens } from '../lib/day';
import { skyColour } from '../lib/sky-colour';
import type { GroundLighting } from './ground-lighting';
import { bindLookKey } from './look-key';

/** A scene with `LOOKS`, which lets go of its listeners on `dispose`. */
export type LookSwitch = CanDispose & {
  /**
   * Draws in `look`, plain being the default; before the renderer is up,
   * only remembers which.
   */
  readonly setLook: (look: Look) => void;
};

export type SceneLook = LookSwitch & {
  /** The renderer is up: dresses the scene in the current look, and draws. */
  readonly start: () => void;
  /**
   * Lights the scene for `heavens` and an eye `height` metres up at
   * `position`: `stepped` is the frames' seconds under play, and with none the
   * wall clock drives the sea.
   */
  readonly shine: (
    heavens: Heavens,
    position: Vec3,
    height: number,
    stepped: number | undefined,
  ) => void;
};

type SceneLookParams = {
  scene: Scene;
  lighting: GroundLighting;
  /** Whether the renderer runs on WebGPU, which the rippled sea needs; read once started. */
  webgpu: () => boolean;
  render: () => void;
  /** Where B steps the look; none under play, where only `setLook` does. */
  keys: HTMLElement | null;
  /** Told each time a look is chosen whether it is fine or swift, for what those alone draw. */
  onLook: (fine: boolean) => void;
};

/**
 * The island's looks: by default the plain one — flat colours under the
 * lamps, a sky of one colour by height and daylight — which a machine short of
 * the others' frame budget still flies smoothly; the fine one — sky, clouds,
 * haze and the sea as a surface; and the swift one, the fine one drawn
 * cheaper.
 */
export function sceneLook({
  scene,
  lighting,
  webgpu,
  render,
  keys,
  onLook,
}: SceneLookParams): SceneLook {
  const plainSky = new Color(skyColour(MAX_HEIGHT, 1));
  scene.background = plainSky;
  let look: Look = 'plain';
  /** Whether the look draws the sky, clouds, haze and the sea's surface. */
  const fine = () => look !== 'plain';
  /** Whether the renderer is up, so the backend a look's sea needs is known. */
  let started = false;
  const dress = () => {
    if (!started) return;
    lighting.dress(fine(), webgpu());
    scene.background = fine() ? null : plainSky;
    scene.backgroundNode = fine() ? lighting.background : null;
    render();
  };
  const setLook = (next: Look) => {
    look = next;
    onLook(fine());
    dress();
  };
  const lookKey =
    keys === null
      ? null
      : bindLookKey(keys, () => {
          setLook(nextLook(look));
        });
  return {
    setLook,
    start: () => {
      started = true;
      dress();
    },
    shine: (heavens, position, height, stepped) => {
      const seconds = stepped ?? Date.now() / 1000;
      const day = lighting.shine(heavens, unit(position), height, seconds);
      if (fine())
        lighting.stirSea({
          ...heavens,
          eye: position,
          time: stepped ?? seconds % HOUR_SECONDS,
        });
      else plainSky.setHex(skyColour(height, day));
    },
    dispose: () => {
      lookKey?.dispose();
    },
  };
}

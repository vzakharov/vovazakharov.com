import { Color, type Scene } from 'three/webgpu';

import type { CanDispose } from '@/kernel/shared/typings';

import { HOUR_SECONDS } from '@/nature/shared/swell';

import { unit, type Vec3 } from '@/island/shared/globe';
import { MAX_HEIGHT } from '@/island/features/eye';

import type { Heavens } from '../lib/day';
import { skyColour } from '../lib/sky-colour';
import { bindFineKey } from './fine-key';
import type { GroundLighting } from './ground-lighting';

/** A scene with two looks, which lets go of its listeners on `dispose`. */
export type FineSwitch = CanDispose & {
  /**
   * Draws in the fine look, or in the plain one (the default); before the
   * renderer is up, only remembers which.
   */
  readonly setFine: (fine: boolean) => void;
};

export type SceneLook = FineSwitch & {
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
  /** Where B toggles the look; none under play, where only `setFine` does. */
  keys: HTMLElement | null;
};

/**
 * The island's two looks: by default the plain one — flat colours under the
 * lamps, a sky of one colour by height and daylight — which a machine short of
 * the fine one's frame budget still flies smoothly; and the fine one — sky,
 * clouds, haze and the sea as a surface.
 */
export function sceneLook({
  scene,
  lighting,
  webgpu,
  render,
  keys,
}: SceneLookParams): SceneLook {
  const plainSky = new Color(skyColour(MAX_HEIGHT, 1));
  scene.background = plainSky;
  let fine = false;
  /** Whether the renderer is up, so the backend a look's sea needs is known. */
  let started = false;
  const dress = () => {
    if (!started) return;
    lighting.dress(fine, webgpu());
    scene.background = fine ? null : plainSky;
    scene.backgroundNode = fine ? lighting.background : null;
    render();
  };
  const setFine = (on: boolean) => {
    fine = on;
    dress();
  };
  const fineKey =
    keys === null
      ? null
      : bindFineKey(keys, () => {
          setFine(!fine);
        });
  return {
    setFine,
    start: () => {
      started = true;
      dress();
    },
    shine: (heavens, position, height, stepped) => {
      const seconds = stepped ?? Date.now() / 1000;
      const day = lighting.shine(heavens, unit(position), height, seconds);
      if (fine)
        lighting.stirSea({
          ...heavens,
          eye: position,
          time: stepped ?? seconds % HOUR_SECONDS,
        });
      else plainSky.setHex(skyColour(height, day));
    },
    dispose: () => {
      fineKey?.dispose();
    },
  };
}

import { abs, max, min, normalize, select, sqrt } from 'three/tsl';
import type { Node } from 'three/webgpu';

import { R } from '@/island/shared/globe';

import { ICE_AT, WEATHER_AT } from '../lib/clouds';
import type { F, V } from './cloud-noise';

/** The eye's place over the planet, as `sky-nodes.ts` holds it. */
export type EyeFrame = {
  readonly up: V;
  readonly height: F;
  /** The eye's distance from the planet's centre. */
  readonly radius: F;
  /** The eye's radius squared less the planet's. */
  readonly shell: F;
};

/** What the sky hands its clouds: the eye's place and the lamps, as `sky-nodes.ts` holds them. */
export type CloudFrame = EyeFrame & {
  readonly towardSun: V;
  readonly towardMoon: V;
};

type Meeting = {
  readonly hit: Node<'bool'>;
  readonly near: F;
  readonly far: F;
};

export type Stretch = { readonly from: F; readonly length: F };

export type CloudRays = {
  /** The stretch of a ray `cosine` off the zenith between the spheres `low` and `high` metres above the sea, cut at `metres`. */
  readonly stretch: (
    cosine: F,
    metres: F,
    low: F | number,
    high: F | number,
  ) => Stretch;
  /** Where a ray crosses the ice cloud's sheet, and whether it does. */
  readonly iceCrossing: (cosine: F) => {
    readonly at: F;
    readonly hit: Node<'bool'>;
  };
  /** The distance down a ray at which its weather is read: where it crosses the cumulus, or half-way to the ice above it. */
  readonly weatherAlong: (cosine: F, iceAt: F) => F;
  /** The height over the sea of the point `along` metres down a ray. */
  readonly overAt: (cosine: F, along: F) => F;
  /** How steeply the ray climbs or falls there: the sine of its angle to the level. */
  readonly steepAt: (cosine: F, along: F) => F;
  /** The unit vector of that point. */
  readonly placeAt: (direction: V, along: F) => V;
};

/** The geometry of a ray from the eye through the shells the clouds lie in. */
export function cloudRays({ up, height, radius, shell }: EyeFrame): CloudRays {
  /** The distances at which a ray meets the sphere `over` metres above the sea. */
  const meets = (cosine: F, over: F | number): Meeting => {
    const half = radius.mul(cosine);
    const inside = half
      .mul(half)
      .sub(height.sub(over).mul(height.add(2 * R).add(over)));
    const root = sqrt(max(inside, 0));
    return {
      hit: inside.greaterThan(0),
      near: half.negate().sub(root),
      far: half.negate().add(root),
    };
  };

  const stretch = (
    cosine: F,
    metres: F,
    low: F | number,
    high: F | number,
  ): Stretch => {
    const base = meets(cosine, low);
    const top = meets(cosine, high);
    const under = height.lessThan(low);
    const above = height.greaterThan(high);
    const falling = cosine.lessThan(0);
    const enter = select(under, base.far, select(above, top.near, 0));
    const leave = select(
      under,
      top.far,
      select(base.hit.and(falling), base.near, top.far),
    );
    // From over the layer, only a ray falling into it meets it.
    const missed = above.and(top.hit.and(falling).not());
    const from = max(enter, 0);
    const length = max(min(leave, metres).sub(from), 0);
    return { from, length: select(missed, 0, length) };
  };

  const iceCrossing = (cosine: F) => {
    const sheet = meets(cosine, ICE_AT);
    const under = height.lessThan(ICE_AT);
    return {
      at: select(under, sheet.far, sheet.near),
      hit: under.or(sheet.hit.and(cosine.lessThan(0))),
    };
  };

  const weatherAlong = (cosine: F, iceAt: F): F => {
    const crossed = meets(cosine, WEATHER_AT);
    return select(
      height.lessThan(WEATHER_AT),
      crossed.far,
      select(
        crossed.hit.and(cosine.lessThan(0)),
        crossed.near,
        max(iceAt, 0).mul(select(height.lessThan(ICE_AT), 0.5, 1)),
      ),
    );
  };

  const overAt = (cosine: F, along: F): F => {
    const gained = along.mul(radius.mul(cosine).mul(2).add(along));
    const far = sqrt(radius.mul(radius).add(gained));
    return shell.add(gained).div(far.add(R));
  };

  const steepAt = (cosine: F, along: F): F => {
    const gained = along.mul(radius.mul(cosine).mul(2).add(along));
    return abs(radius.mul(cosine).add(along)).div(
      sqrt(radius.mul(radius).add(gained)),
    );
  };

  const placeAt = (direction: V, along: F): V =>
    normalize(up.mul(radius).add(direction.mul(along)));

  return { stretch, iceCrossing, weatherAlong, overAt, steepAt, placeAt };
}

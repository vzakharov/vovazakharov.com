import type { Rgb } from '@/cube/shared/lib/colour';
import { vec3f, type Wgsl, wgsl } from '@/cube/shared/shader';

import { GRADE } from './grade';
import { type Graded, hazed, lensListing } from './lens';
import { LIGHT } from './light';

/** An ordinary floor's light, air and lens, as numbers. */
type Ordinary = Graded & {
  /** The lamps' colour times their strength. */
  lamp: Rgb;
  /** Panels along each side of a room's ceiling, and one's size in metres. */
  grid: number;
  panel: readonly [east: number, south: number];
  /** The share of rooms whose lamps stutter. */
  stutter: number;
};

/**
 * The light and the lens of a floor that is a lit room and nothing stranger:
 * `lamps()`, `themeLight` and `themeLens`, leaving its theme `themeMaterial`
 * to write. A floor that breaks the picture writes its own in their place.
 */
export const ordinary = (id: string, look: Ordinary): Wgsl =>
  wgsl(
    `${id}/ordinary`,
    /* wgsl */ `
fn lamps() -> Lamps {
  return Lamps(
    ${vec3f(look.lamp)},
    ${vec3f(look.ambient)},
    ${String(look.grid)},
    vec2f(${look.panel.map((side) => side.toFixed(3)).join(', ')}),
    ${look.stutter.toFixed(3)},
  );
}

fn themeLight(s: Surf, m: Material) -> vec3f {
  return ${hazed('roomLight(s, m, lamps())', look)};
}
${lensListing(look)}
`,
    LIGHT,
    GRADE,
  );

import type { Rgb } from '@/cube/shared/lib/colour';
import { vec3f, type Wgsl, wgsl } from '@/cube/shared/shader';

<<<<<<< HEAD
import { GRADE } from './grade.shader';
import { LIGHT } from './light.shader';
import { vec3f, type Wgsl, wgsl } from './wgsl';

/** An ordinary floor's light and lens, as numbers. */
type Ordinary = {
  /** The lamps' colour times their strength, and the light left without them. */
=======
import { GRADE } from './grade';
import { type Graded, hazed, lensListing } from './lens';
import { LIGHT } from './light';

/** An ordinary floor's light, air and lens, as numbers. */
type Ordinary = Graded & {
  /** The lamps' colour times their strength. */
>>>>>>> origin/claude/cube-review-perf
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
<<<<<<< HEAD
  return haze(roomLight(s, m, lamps()), s, AIR, ${look.visibility.toFixed(1)});
}

fn themeLens(l: Lens) -> vec3f {
  let seen = through(l, ${look.glow.toFixed(3)}, ${look.fringe.toFixed(4)}) * ${look.exposure.toFixed(3)};
  return tonemap(seen) * vignette(l, ${look.vignette.toFixed(3)}) + grain(l) * ${look.noise.toFixed(4)};
=======
  return ${hazed('roomLight(s, m, lamps())', look)};
>>>>>>> origin/claude/cube-review-perf
}
${lensListing(look)}
`,
    LIGHT,
    GRADE,
  );

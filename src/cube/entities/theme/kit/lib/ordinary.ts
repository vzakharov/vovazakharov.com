import type { Rgb } from '@/cube/shared/lib/colour';
import { vec3f, type Wgsl, wgsl } from '@/cube/shared/lib/wgsl';

import type { Aired } from '../model/theme';
import { type Exposed, GRADE } from './grade';
import { LIGHT } from './light';

/** An ordinary floor's light, air and lens, as numbers. */
type Ordinary = Aired &
  Exposed & {
    /** The lamps' colour times their strength, and the light left without them. */
    lamp: Rgb;
    ambient: Rgb;
    /** Panels along each side of a room's ceiling, and one's size in metres. */
    grid: number;
    panel: readonly [east: number, south: number];
    /** The share of rooms whose lamps stutter. */
    stutter: number;
    /** Metres at which the air has swallowed about two thirds of a thing. */
    visibility: number;
    /** How far bright things bleed, and how far colours part in the corners. */
    glow: number;
    fringe: number;
    /** How far the screen's corners darken, and how strong the grain is. */
    vignette: number;
    noise: number;
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
  return haze(roomLight(s, m, lamps()), s, ${vec3f(look.air)}, ${look.visibility.toFixed(1)});
}

fn themeLens(l: Lens) -> vec3f {
  let seen = through(l, ${look.glow.toFixed(3)}, ${look.fringe.toFixed(4)}) * ${look.exposure.toFixed(3)};
  return tonemap(seen) * vignette(l, ${look.vignette.toFixed(3)}) + grain(l) * ${look.noise.toFixed(4)};
}
`,
    LIGHT,
    GRADE,
  );

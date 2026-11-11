import { hex, linear } from '@/cube/shared/lib/colour';

import { FINISH } from '../../lib/kit/finish';
import { ordinary } from '../../lib/kit/ordinary';
import { STUFF } from '../../lib/kit/stuff';
import { wgsl } from '../../lib/wgsl';
import type { FloorTheme } from '../../model/theme';

const AIR = linear(hex(0x10130f));

/**
 * An office cleared for a tenant who never came: carpet tiles laid
 * chequerwise, pinstriped sage paper, troffers humming over nothing.
 */
export const OPEN_PLAN: FloorTheme = {
  name: 'Open plan',
  air: AIR,
  pillar: 0.03,
  dark: 0,
  sound: { footing: 'carpet', hum: 120, air: 0.3, ring: 0.5 },
  shader: wgsl(
    'open-plan',
    /* wgsl */ `
fn carpetTiles(s: Surf) -> Material {
  let tile = tiling(s.uv, 0.5, 0.004, 21u);
  let at = vec2i(floor(s.uv / 0.5));
  let turned = f32((at.x + at.y) & 1);
  let blue = vec3f(0.045, 0.075, 0.115) * (0.85 + 0.25 * turned) * (0.9 + 0.2 * tile.y);
  let pile = valueNoise(s.uv * 240.0, 11u);
  return embossed(s, matte(carpet(s, blue) * mix(0.55, 1.0, tile.x)), pile + tile.x, 0.0015);
}

fn papered(s: Surf) -> Material {
  let stripe = band(fract(s.uv.x / 0.12) * 0.12, 0.06, 0.012);
  let sage = plaster(s, vec3f(0.3, 0.37, 0.25)) * (1.0 - 0.22 * stripe);
  let stained = mix(sage, sage * vec3f(0.6, 0.5, 0.3), damp(s));
  let skirting = 1.0 - smoothstep(0.1, 0.104, s.p.y);
  let wall = polished(mix(stained, vec3f(0.025, 0.025, 0.025), skirting), mix(0.08, 0.5, skirting));
  let weave = valueNoise(s.uv * vec2f(260.0, 90.0), 22u);
  return embossed(s, wall, stripe + 0.3 * weave + 4.0 * skirting, 0.0012);
}

fn gridCeiling(s: Surf) -> Material {
  let tile = tiling(s.uv, 0.625, 0.024, 4u);
  let fleck = fbm(s.uv * 40.0, 6u, 2);
  let white = vec3f(0.5, 0.51, 0.46) * (0.85 + 0.2 * fleck);
  let bar = vec3f(0.42, 0.42, 0.4);
  let albedo = mix(bar, white, tile.x) * (1.0 - 0.55 * damp(s));
  let ceiling = Material(albedo, lampGlow(s, lamps()), 0.3 * (1.0 - tile.x), vec3f(0.0));
  return embossed(s, ceiling, 0.3 * fleck - tile.x, 0.008);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: { return papered(s); }
    case FLOOR, OWNED: { return carpetTiles(s); }
    case CEILING: { return gridCeiling(s); }
    case TRIM: { return polished(plaster(s, vec3f(0.36, 0.36, 0.33)), 0.2); }
    default: { return stuff(s); }
  }
}
`,
    FINISH,
    STUFF,
    ordinary('open-plan', {
      air: AIR,
      lamp: [1.2, 1.34, 1.22],
      ambient: [0.009, 0.011, 0.01],
      grid: 2,
      panel: [0.6, 1.2],
      stutter: 0,
      reach: 45,
      exposure: 1,
      glow: 0.55,
      fringe: 0.005,
      vignette: 0.35,
      grain: 0.016,
    }),
  ),
};

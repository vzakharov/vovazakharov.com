import { hsl, hueOf, linear } from '@/cube/shared/lib/colour';

import { FINISH } from '../lib/kit/finish';
import { ordinary } from '../lib/kit/ordinary';
import { STUFF } from '../lib/kit/stuff';
import { vec3f, wgsl } from '../lib/wgsl';
import type { FloorTheme } from '../model/theme';

/**
 * Floor `n` before anyone has designed it: a plain lit room in the floor's
 * own hue, so every floor of the cube can be stood on.
 */
export function generic(n: number): FloorTheme {
  const hue = hueOf(n);
  const id = `generic-${String(n)}`;
  const air = linear(hsl(hue, 0.25, 0.07));
  return {
    name: `Floor ${String(n)}`,
    air,
    pillar: 0.024,
    dark: 0.08,
    sound: { footing: 'carpet', hum: 100, air: 0.2, ring: 0.8 },
    decor: [
      { thing: 'vent', share: 0.3 },
      { thing: 'exit-sign', share: 0.1 },
      { thing: 'cardboard-box', share: 0.1 },
    ],
    shader: wgsl(
      id,
      /* wgsl */ `
fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      let skirting = 1.0 - smoothstep(0.1, 0.104, s.p.y);
      let wall = plaster(s, ${vec3f(linear(hsl(hue, 0.4, 0.55)))});
      let rough = fbm(s.uv * 24.0, 3u, 3);
      let painted = polished(mix(wall, ${vec3f(linear(hsl(hue, 0.3, 0.16)))}, skirting), 0.1 + 0.4 * skirting);
      return embossed(s, painted, 0.3 * rough + 4.0 * skirting, 0.002);
    }
    case FLOOR, OWNED: {
      let pile = valueNoise(s.uv * 240.0, 11u);
      return embossed(s, matte(carpet(s, ${vec3f(linear(hsl(hue + 30, 0.25, 0.32)))})), pile, 0.0015);
    }
    case CEILING: {
      let tile = tiling(s.uv, 0.625, 0.02, 4u);
      let white = vec3f(0.5, 0.5, 0.46) * (0.92 + 0.08 * tile.y);
      return embossed(s, glowing(mix(white * 0.4, white, tile.x), lampGlow(s, lamps())), tile.x, 0.006);
    }
    default: { return stuff(s); }
  }
}
`,
      FINISH,
      STUFF,
      ordinary(id, {
        air,
        lamp: [1.3, 1.25, 1.14],
        ambient: [0.01, 0.01, 0.01],
        grid: 2,
        panel: [0.6, 1.2],
        stutter: 0.1,
        reach: 50,
        exposure: 1,
        glow: 0.12,
        fringe: 0.005,
        vignette: 0.35,
        grain: 0.015,
      }),
    ),
  };
}

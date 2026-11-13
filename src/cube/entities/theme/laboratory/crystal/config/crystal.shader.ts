// Generated from crystal.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, LIGHT, STUFF } from '../../../kit';
import { SMALL_WORLD } from '../../small-world';

export const CRYSTAL_SHADER = wgsl(
  'cube/entities/theme/laboratory/crystal/config/crystal',
  /* wgsl */ `
const INNER_LIGHT = vec3f(0.25, 0.5, 0.9);

/// A wall's own sideways direction, so a facet can be tilted in its plane.
fn alongOf(s: Surf) -> vec3f {
  return vec3f(-s.normal.z, 0.0, s.normal.x);
}

fn facets(s: Surf) -> Material {
  // Tall shards: the lattice is stretched upward.
  let shard = shards(s.uv * vec2f(2.6, 1.1), 431u);
  let seam = 1.0 - smoothstep(0.0, 0.05, shard.x);
  let tilt =
    alongOf(s) * (shard.y - 0.5) * 1.3 + vec3f(0.0, 1.0, 0.0)
      * (shard.z - 0.5)
      * 0.9;
  let veil = fbm(s.uv * 3.0 + shard.y * 30.0, 432u, 4);
  let flaw =
    1.0 - smoothstep(
      0.0,
      0.03,
      abs(fbm(s.uv * 2.0 + shard.z * 9.0, 433u, 3) - 0.5),
    );
  let body =
    mix(
      vec3f(0.12, 0.2, 0.3),
      vec3f(0.5, 0.62, 0.7),
      veil,
    ) * (0.6 + 0.6 * shard.z);
  let albedo =
    mix(
      body,
      vec3f(0.75, 0.85, 0.95),
      max(0.8 * seam, 0.5 * flaw * step(0.5, shard.y)),
    );
  // Light caught inside a shard and let out again along its seams.
  let inner = INNER_LIGHT * 0.12 * (seam + 0.6 * veil * veil);
  return Material(albedo, inner, 0.92 - 0.5 * seam, tilt);
}

fn salt(s: Surf) -> Material {
  // Hopper crystals: squares grown in steps toward their middles.
  let cell = s.uv / 0.9;
  let at = abs(fract(cell) - 0.5) * 2.0;
  let ring = max(at.x, at.y);
  let own = unitOf(cellHash(vec2i(floor(cell)), 434u));
  let steps = 3.0 + floor(own * 4.0);
  let terrace = floor(ring * steps) / steps;
  let riser = 1.0 - smoothstep(0.0, 0.05, fract(ring * steps));
  let cloud = fbm(s.uv * 2.5, 435u, 4);
  let halite =
    mix(vec3f(0.16, 0.2, 0.27), vec3f(0.3, 0.22, 0.24), own)
      * (0.55 + 0.5 * cloud)
      * (0.6 + 0.4 * terrace);
  let albedo = mix(halite, vec3f(0.55, 0.6, 0.66), 0.7 * riser);
  let slab = Material(albedo, INNER_LIGHT * 0.05 * riser, 0.88, vec3f(0.0));
  return embossed(s, slab, terrace - 0.2 * riser, 0.06);
}

fn geode(s: Surf) -> Material {
  let tooth = shards(s.uv * 4.5, 436u);
  let seam = 1.0 - smoothstep(0.0, 0.06, tooth.x);
  let amethyst =
    mix(
      vec3f(0.1, 0.03, 0.2),
      vec3f(0.45, 0.2, 0.62),
      tooth.y,
    ) * (1.3 - tooth.w);
  let glint = pow(tooth.z, 6.0);
  let m =
    Material(
      mix(amethyst, vec3f(0.6, 0.5, 0.75), seam),
      lampGlow(s, lamps()) + vec3f(0.3, 0.1, 0.6) * 0.25 * glint,
      0.85,
      vec3f(0.0),
    );
  return embossed(s, m, 1.0 - tooth.w, 0.1);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return facets(s);
    }
    case FLOOR, OWNED: {
      return salt(s);
    }
    case CEILING: {
      return geode(s);
    }
    case TRIM: {
      let veil = fbm(s.uv * vec2f(8.0, 1.5), 437u, 4);
      return
        Material(
          mix(vec3f(0.3, 0.4, 0.5), vec3f(0.7, 0.8, 0.9), veil),
          INNER_LIGHT * 0.2 * veil,
          0.95,
          vec3f(0.0),
        );
    }
    default: {
      return stuff(s);
    }
  }
}
`,
  HASH,
  SMALL_WORLD,
  CORE,
  STUFF,
  LIGHT,
);

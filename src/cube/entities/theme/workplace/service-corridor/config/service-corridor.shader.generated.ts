// Generated from service-corridor.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, FINISH, LIGHT, STUFF } from '../../../kit';
import { STENCIL } from '../../stencil';

export const SERVICE_CORRIDOR_SHADER = wgsl(
  'cube/entities/theme/workplace/service-corridor/config/service-corridor',
  /* wgsl */ `
fn blockwork(s: Surf) -> Material {
  let h = s.p.y;
  let row = floor(h / 0.2);
  let at = vec2f(s.uv.x / 0.4 + 0.5 * (row - 2.0 * floor(row * 0.5)), h / 0.2);
  let f = fract(at);
  let joint = min(min(f.x, 1.0 - f.x) * 0.4, min(f.y, 1.0 - f.y) * 0.2);
  let mortar = 1.0 - smoothstep(0.003, 0.013, joint);
  let block = unitOf(cellHash(vec2i(floor(at)), 101u));
  let pores = valueNoise(s.uv * 130.0, 102u);
  let pits = smoothstep(0.78, 0.86, valueNoise(s.uv * 90.0, 103u));
  let grime = fbm(s.uv * 0.9, s.seed ^ 0x68u, 4);

  let low = 1.0 - smoothstep(0.98, 0.984, h);
  let white = vec3f(0.5, 0.5, 0.45) * (0.8 + 0.1 * block + 0.2 * grime);
  let grey = vec3f(0.15, 0.17, 0.17) * (0.85 + 0.1 * block + 0.2 * grime);
  // Trolleys take the paint off below the rail, down to the block.
  let gouge = fbm(vec2f(s.uv.x * 1.1, h * 22.0), 104u, 3);
  let scraped =
    low
      * smoothstep(0.58, 0.66, gouge + 0.12 * pores)
      * smoothstep(0.12, 0.35, h);
  let bare = vec3f(0.3, 0.29, 0.27) * (0.8 + 0.3 * pores);
  // Hands and shoulders grey the white at their height.
  let handled =
    band(h, 1.35, 0.5) * smoothstep(
      0.4,
      0.75,
      fbm(vec2f(s.uv.x * 0.8, h * 3.0), 105u, 3),
    );
  var albedo =
    mix(mix(white * (1.0 - 0.3 * handled), grey, low), bare, scraped);
  albedo *= (1.0 - 0.35 * mortar) * (1.0 - 0.25 * pits) * (1.0 - 0.5 * damp(s));

  // A rubber rail takes what the trolleys would give the wall.
  let rail = band(h, 0.9, 0.16);
  let lip = 1.0 - smoothstep(0.0, 0.08, abs(h - 0.9));
  let nicked =
    smoothstep(0.6, 0.8, fbm(vec2f(s.uv.x * 3.0, h * 40.0), 106u, 3));
  let rubber = vec3f(0.018, 0.018, 0.02) * (1.0 + 2.0 * nicked);
  let skirt = 1.0 - smoothstep(0.1, 0.104, h);
  albedo = mix(mix(albedo, rubber, rail), vec3f(0.02), skirt);

  let wall =
    polished(
      albedo,
      mix(0.12 + 0.3 * low * (1.0 - scraped), 0.3, max(rail, skirt)),
    );
  let height =
    (0.15 * pores - mortar - 0.5 * pits - 0.6 * scraped) * (1.0 - rail)
      + 6.0 * rail * lip
      + 2.0 * skirt;
  return embossed(s, wall, height, 0.004);
}

fn epoxy(s: Surf) -> Material {
  let flow = fbm(s.uv * 1.1, 111u, 4);
  let fleck = valueNoise(s.uv * 170.0, 112u);
  let red = vec3f(0.27, 0.045, 0.03) * (0.75 + 0.4 * flow);
  // Worn down to the slab where everything turns.
  let bared =
    smoothstep(
      0.7,
      0.74,
      fbm(s.uv * 0.45, 113u, 4) + 0.08 * fbm(s.uv * 9.0, 117u, 3),
    );
  let slab =
    vec3f(0.17, 0.17, 0.16) * (0.85 + 0.2 * fleck) * (0.8 + 0.4 * flow);
  // Wheels leave rubber both ways.
  let east =
    smoothstep(0.62, 0.8, fbm(vec2f(s.uv.x * 0.25, s.uv.y * 16.0), 114u, 3));
  let south =
    smoothstep(0.66, 0.82, fbm(vec2f(s.uv.x * 16.0, s.uv.y * 0.25), 115u, 3));
  let tracked = 1.0 - 0.55 * max(east, south);

  // A yellow line keeps trolleys off every wall there is.
  let line =
    band(wallInset(s), 0.4, 0.09) * smoothstep(
      0.3,
      0.5,
      fbm(s.uv * 3.0, 116u, 3) + 0.2 * fleck,
    );
  let cut = 1.0 - smoothstep(0.004, 0.012, toNearestSide(s));

  var albedo =
    mix(mix(red, slab, bared), vec3f(0.55, 0.4, 0.03), line * (1.0 - bared));
  albedo *= tracked * (1.0 - 0.7 * cut);
  let gloss = mix(0.88, 0.25, bared) * (0.75 + 0.25 * tracked);
  return
    embossed(
      s,
      polished(albedo, gloss),
      2.0 * flow - 3.0 * cut - bared * (1.0 + 0.3 * fleck),
      0.0015,
    );
}

fn openDeck(s: Surf) -> Material {
  // Steel decking sprayed black, flutes running south.
  let flute = smoothstep(0.25, 0.75, 0.5 + 0.5 * cos(s.uv.x * 6.2832 / 0.22));
  let spray = valueNoise(s.uv * 60.0, 121u);
  var albedo = vec3f(0.022, 0.022, 0.024) * (0.6 + 0.5 * flute + 0.4 * spray);
  var height = 0.25 * flute;
  var gloss = 0.1;

  // The air duct, galvanised, down the middle; its seams and hangers.
  let across = s.p.z - 2.5;
  let duct = 1.0 - smoothstep(0.36, 0.365, abs(across));
  let spangle = worley(s.uv * 45.0, 122u);
  let seam = band(fract(s.uv.x / 1.25) * 1.25, 0.625, 0.03);
  let zinc =
    vec3f(0.3, 0.32, 0.33) * (0.85 + 0.15 * spangle.y) * (1.0 - 0.5 * seam);
  albedo = mix(albedo, zinc, duct);
  gloss = mix(gloss, 0.5, duct);
  height =
    mix(
      height,
      1.0 + 0.15 * seam + 0.05 * spangle.y,
      1.0 - smoothstep(0.3, 0.37, abs(across)),
    );

  // Three conduits and a sprinkler line keep it company.
  let run = s.p.z - 0.55;
  for (var i = 0; i < 3; i++) {
    let off = (run - f32(i) * 0.07) / 0.02;
    let tube = 1.0 - smoothstep(0.85, 1.0, abs(off));
    let round = sqrt(max(1.0 - off * off, 0.0));
    albedo = mix(albedo, vec3f(0.28, 0.29, 0.3) * (0.3 + 0.7 * round), tube);
    height = mix(height, 0.3 + 0.3 * round, tube);
  }
  let main = (s.p.z - 4.45) / 0.04;
  let pipe = 1.0 - smoothstep(0.9, 1.0, abs(main));
  let body = sqrt(max(1.0 - main * main, 0.0));
  albedo = mix(albedo, vec3f(0.42, 0.04, 0.03) * (0.3 + 0.7 * body), pipe);
  gloss = mix(gloss, 0.4, pipe);
  height = mix(height, 0.4 + 0.4 * body, pipe);

  return
    embossed(
      s,
      Material(albedo, lampGlow(s, lamps()), gloss, vec3f(0.0)),
      height,
      0.12,
    );
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return blockwork(s);
    }
    case FLOOR, OWNED: {
      return epoxy(s);
    }
    case CEILING: {
      return openDeck(s);
    }
    case TRIM: {
      // A steel corner guard to the rail's height, bare paint above.
      let guard = 1.0 - smoothstep(1.2, 1.204, s.p.y);
      let brushed = valueNoise(vec2f(s.uv.x * 8.0, s.p.y * 260.0), 123u);
      let steel = vec3f(0.34, 0.35, 0.36) * (0.75 + 0.3 * brushed);
      let paint =
        vec3f(0.5, 0.5, 0.45) * (0.85 + 0.2 * fbm(s.uv * 3.0, 124u, 3));
      return polished(mix(paint, steel, guard), mix(0.1, 0.6, guard));
    }
    default: {
      return stuff(s);
    }
  }
}
`,
  CORE,
  HASH,
  FINISH,
  STUFF,
  STENCIL,
  LIGHT,
);

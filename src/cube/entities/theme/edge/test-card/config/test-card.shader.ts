// Generated from test-card.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/cube/shared/shader';

import { CORE, GRADE, LIGHT, STUFF } from '../../../kit';
import { PATTERN } from '../../pattern';
import { SCREEN } from '../../screen';

export const TEST_CARD_SHADER = wgsl(
  'cube/entities/theme/edge/test-card/config/test-card',
  /* wgsl */ `
const BARS =
  array<vec3f, 7>(
    vec3f(0.52, 0.52, 0.52),
    vec3f(0.52, 0.52, 0.0),
    vec3f(0.0, 0.52, 0.52),
    vec3f(0.0, 0.52, 0.0),
    vec3f(0.52, 0.0, 0.52),
    vec3f(0.52, 0.0, 0.0),
    vec3f(0.0, 0.0, 0.52),
  );

/// The bars as a wall carries them: seven colours, under them the same in
/// reverse with black between, and at the foot the blacks a set is tuned by.
fn bars(s: Surf) -> vec3f {
  let across = clamp(alongWall(s) / ROOM.x, 0.0, 0.9999);
  let bar = u32(across * 7.0);
  if (s.p.y > 0.78) {
    return BARS[bar];
  }
  if (s.p.y > 0.6) {
    return select(vec3f(0.004), BARS[6u - bar], (bar & 1u) == 0u);
  }
  let foot = u32(across * 28.0);
  if (foot < 5u) {
    return vec3f(0.0, 0.015, 0.07);
  }
  if (foot < 10u) {
    return vec3f(1.0);
  }
  if (foot < 15u) {
    return vec3f(0.03, 0.0, 0.1);
  }
  if (foot < 20u || foot > 23u) {
    return vec3f(0.004);
  }
  return vec3f(0.006 * f32(foot - 19u));
}

/// The floor's rows, a metre and a quarter each: grey steps up, bursts of
/// ever finer stripes, grey steps down, a fine chequer.
fn steps(s: Surf) -> vec3f {
  let row = u32(floor(s.uv.y / 1.25)) & 3u;
  let across = fract(s.uv.x / ROOM.x);
  if (row == 1u) {
    let burst = floor(across * 6.0);
    let fine = 0.32 / exp2(burst);
    return vec3f(mix(0.03, 0.6, chequer(vec2f(s.uv.x, 0.0), fine)));
  }
  if (row == 3u) {
    return vec3f(mix(0.02, 0.5, chequer(s.uv, 0.078125)));
  }
  let rise = floor(select(across, 1.0 - across, row == 2u) * 10.0) / 9.0;
  return vec3f(pow(rise, 2.2) * 0.8 + 0.004);
}

fn tube(colour: vec3f, gloss: f32) -> Material {
  return Material(colour * 0.75, colour * 0.3, gloss, vec3f(0.0));
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return tube(bars(s), 0.3);
    }
    case FLOOR, OWNED: {
      return tube(steps(s), 0.55);
    }
    case CEILING: {
      let out = fromMiddle(s);
      let circle = 1.0 - smoothstep(0.015, 0.03, abs(out - 2.2));
      let lines = max(ruled(s.uv, 0.3125, 0.008), circle);
      let card = tube(mix(vec3f(0.035), vec3f(0.6), lines), 0.0);
      return glowing(card.albedo, card.emission + lampGlow(s, lamps()));
    }
    case TRIM: {
      return tube(vec3f(mix(0.004, 0.6, step(0.5, fract(s.uv.y * 12.0)))), 0.3);
    }
    default: {
      return stuff(s);
    }
  }
}

fn themeLens(l: Lens) -> vec3f {
  // The glass bulges, so the picture does.
  let middle = l.uv - 0.5;
  let at = l.uv + middle * dot(middle, middle) * 0.14;
  let inside = step(max(abs(at.x - 0.5), abs(at.y - 0.5)), 0.5);
  // The three guns have drifted apart sideways.
  let drift = vec2f(0.0022, 0.0);
  let beam =
    vec3f(sceneAt(at + drift).r, sceneAt(at).g, sceneAt(at - drift).b) + glowAt(
      at,
    ) * 0.3;
  let mask = 0.86 + 0.14 * cos(l.pixel.x * 2.0944 + vec3f(0.0, 2.0944, 4.1888));
  let hum =
    1.0 - 0.1 * smoothstep(
      0.0,
      0.25,
      abs(fract(at.y - l.time * 0.11) - 0.5) * 2.0 - 0.6,
    );
  let picture =
    tonemap(beam * 1.15) * mask * scanned(l, l.size.y / 3.0, 0.3) * hum;
  return picture * inside * vignette(l, 0.45) + grain(l) * 0.02;
}
`,
  CORE,
  PATTERN,
  SCREEN,
  STUFF,
  LIGHT,
  GRADE,
);

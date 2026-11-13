import { vecf, wgsl } from '../lib/wgsl';
import { OUTDOOR_STAGE } from '../outside/stage';
import { SUN } from '../outside/sun';

/**
 * Pure sea water's absorption per metre, red to blue, with a little of the
 * green a coast's water carries (Pope & Fry 1997 for the water itself; Morel
 * & Maritorena 2001 for what lives in it).
 */
const ABSORB = [0.42, 0.063, 0.022] as const;
/** Sea water's backscatter per metre, red to blue (Morel & Maritorena 2001). */
const BACKSCATTER = [0.0035, 0.0048, 0.0062] as const;
/** The share of what a coast's water scatters that goes backward (Petzold 1972). */
const BACKWARD_SHARE = 0.0183;
/** What a beam loses per metre, absorbed or scattered out of its line. */
const ATTENUATE = ABSORB.map(
  (absorb, channel) => absorb + (BACKSCATTER[channel] ?? 0) / BACKWARD_SHARE,
);

/**
 * The water's body as every layer may need it, none of the sea's own bindings
 * among its needs, so the sky's backdrop and the sand take it too:
 *
 * - `fresnel(cosine)`, what water reflects of light meeting it at that cosine;
 * - `kept(depth)`, what that many metres of water keep of light, per channel,
 *   scattered light that goes on the same way counted in;
 * - `sunEntering()`, the sun's light let in per unit of level surface;
 * - `drownedBody()`, what the water's body shows an eye inside it, and
 *   `throughWater(colour, metres)`, `colour` seen through that much of it,
 *   whose scattering blurs a thing out of sight long before it is dark;
 * - `underStill(a, b)`, the metres of the segment from `a` to `b` that lie
 *   under the still sea.
 */
export const WATER_BODY = wgsl(
  'sea/water-body',
  /* wgsl */ `
const ABSORB = ${vecf(ABSORB)};
const BACKSCATTER = ${vecf(BACKSCATTER)};
const ATTENUATE = ${vecf(ATTENUATE)};
/// What water returns of light meeting it head on.
const HEAD_ON = 0.0204;
/// What the water's body shows an eye inside it, of the light falling on it.
const DROWNED = vec3f(0.035, 0.13, 0.15);

fn fresnel(cosine: f32) -> f32 {
  let away = 1.0 - clamp(cosine, 0.0, 1.0);
  let fifth = away * away * away * away * away;
  return HEAD_ON + (1.0 - HEAD_ON) * fifth;
}

/// What water \`depth\` metres deep keeps of light crossing it.
fn kept(depth: f32) -> vec3f {
  return exp(-ABSORB * max(depth, 0.0));
}

fn sunEntering() -> vec3f {
  return SUN_LIGHT * frame.sun.y * (1.0 - fresnel(frame.sun.y));
}

/// The body in the open sun: the colour a ray running on through water
/// comes to, whatever lies at its end.
fn drownedBody() -> vec3f {
  return DROWNED * (sunEntering() + SKY_FILL);
}

fn throughWater(colour: vec3f, metres: f32) -> vec3f {
  let keeps = exp(-ATTENUATE * max(metres, 0.0));
  return colour * keeps + drownedBody() * (vec3f(1.0) - keeps);
}

fn underStill(a: vec3f, b: vec3f) -> f32 {
  let low = min(a.y, b.y);
  let high = max(a.y, b.y);
  return clamp(-low / max(high - low, 1e-4), 0.0, 1.0) * length(b - a);
}
`,
  OUTDOOR_STAGE,
  SUN,
);

import { f32 } from '../lib/wgsl';
import { HOUR_SECONDS, RADIANS_A_TURN } from '../outside/swell';
import { CASCADES, CHOP, TILE } from './cascade';

/** Complex pairs a cascade's transform carries: two textures' worth. */
export const FIELD_LAYERS = CASCADES.length * 2;

const COMPLEX = /* wgsl */ `
const TAU = ${f32(RADIANS_A_TURN)};
const TILE = ${String(TILE)}u;

fn times(a: vec2f, b: vec2f) -> vec2f {
  return vec2f(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

/// Two real fields' spectra as one complex one: \`a + i b\`.
fn paired(a: vec2f, b: vec2f) -> vec2f {
  return vec2f(a.x - b.y, a.y + b.x);
}
`;

/**
 * The first pass: every wave of every cascade turned to the clock's moment,
 * and from it the spectra of the surface's height, its sideways shift and
 * their gradients, paired two real fields to a complex one.
 */
export const EVOLVE_SHADER = /* wgsl */ `
${COMPLEX}

struct Moment {
  /// Whole seconds into the hour, and the rest of the second.
  whole: u32,
  part: f32,
  /// Metres each cascade's tile spans.
  sides: vec4f,
}

@group(0) @binding(0) var<uniform> moment: Moment;
@group(0) @binding(1) var waves: texture_2d_array<f32>;
@group(0) @binding(2) var turns: texture_2d_array<u32>;
@group(0) @binding(3) var field: texture_storage_2d_array<rgba32float, write>;

fn bin(i: u32) -> f32 {
  return select(f32(i) - f32(TILE), f32(i), i < TILE / 2u);
}

@compute @workgroup_size(8, 8)
fn evolve(@builtin(global_invocation_id) id: vec3u) {
  let cascade = id.z;
  let at = vec2i(id.xy);
  let wave = textureLoad(waves, at, cascade, 0);
  let n = textureLoad(turns, at, cascade, 0).r;
  // The wave's turns so far this hour, the whole seconds' share in integers
  // so that a late second is as exact as an early one.
  let whole = f32((n * moment.whole) % ${String(HOUR_SECONDS)}u) / ${String(HOUR_SECONDS)}.0;
  let phase = TAU * fract(whole + f32(n) * moment.part / ${String(HOUR_SECONDS)}.0);
  let spin = vec2f(cos(phase), sin(phase));
  let h = times(wave.xy, vec2f(spin.x, -spin.y)) + times(wave.zw, spin);
  let k = TAU * vec2f(bin(id.x), bin(id.y)) / moment.sides[cascade];
  let size = length(k);
  let unit = select(vec2f(0.0), k / size, size > 0.0);
  let ih = vec2f(-h.y, h.x);
  let shift = ${String(CHOP)} * unit;
  // Height Y, shift D = -i k/|k| h, and their gradients along x and z.
  let dx = -shift.x * ih;
  let dz = -shift.y * ih;
  let yx = k.x * ih;
  let yz = k.y * ih;
  let dxx = shift.x * k.x * h;
  let dzz = shift.y * k.y * h;
  let dxz = shift.x * k.y * h;
  textureStore(field, at, 2u * cascade, vec4f(paired(dx, dz), paired(h, dxz)));
  textureStore(field, at, 2u * cascade + 1u, vec4f(paired(yx, yz), paired(dxx, dzz)));
}
`;

/**
 * One stage of the radix-2 inverse transform along one axis; sixteen of them
 * take a tile from wavenumbers to metres. The first stage along an axis reads
 * its input in bit-reversed order, so no pass is spent on reordering.
 */
export const TRANSFORM_SHADER = /* wgsl */ `
${COMPLEX}

struct Stage {
  stage: u32,
  /// 0 along x, 1 along z.
  axis: u32,
}

@group(0) @binding(0) var<uniform> now: Stage;
@group(0) @binding(1) var source: texture_2d_array<f32>;
@group(0) @binding(2) var to: texture_storage_2d_array<rgba32float, write>;

fn reversed(i: u32) -> u32 {
  return reverseBits(i) >> (32u - firstTrailingBit(TILE));
}

fn along(at: vec2u, line: u32) -> vec2u {
  return select(vec2u(line, at.y), vec2u(at.x, line), now.axis == 1u);
}

@compute @workgroup_size(8, 8)
fn transform(@builtin(global_invocation_id) id: vec3u) {
  let line = select(id.x, id.y, now.axis == 1u);
  let span = 2u << now.stage;
  let half = span >> 1u;
  let within = line & (span - 1u);
  let lower = within < half;
  let step = select(within - half, within, lower);
  var first = line - within + step;
  var second = first + half;
  if (now.stage == 0u) {
    first = reversed(first);
    second = reversed(second);
  }
  let a = textureLoad(source, along(id.xy, first), id.z, 0);
  let b = textureLoad(source, along(id.xy, second), id.z, 0);
  let angle = TAU * f32(step) / f32(span);
  let twist = vec2f(cos(angle), sin(angle));
  let turned = vec4f(times(b.xy, twist), times(b.zw, twist));
  textureStore(to, id.xy, id.z, select(a - turned, a + turned, lower));
}
`;

/**
 * The last pass: the transformed fields laid out as the three maps the sea is
 * drawn from. \`shift\` is where a point of the still surface goes (x, up, z);
 * \`slope\` the height's gradient and the shift's own stretch; \`moment\` the
 * gradient's second moments, whose mips are what keep distant glitter as wide
 * as the waves under one pixel make it.
 */
export const LAY_SHADER = /* wgsl */ `
@group(0) @binding(0) var field: texture_2d_array<f32>;
@group(0) @binding(1) var shift: texture_storage_2d_array<rgba16float, write>;
@group(0) @binding(2) var slope: texture_storage_2d_array<rgba16float, write>;
@group(0) @binding(3) var moment: texture_storage_2d_array<rgba16float, write>;

@compute @workgroup_size(8, 8)
fn lay(@builtin(global_invocation_id) id: vec3u) {
  let at = vec2i(id.xy);
  let a = textureLoad(field, at, 2u * id.z, 0);
  let b = textureLoad(field, at, 2u * id.z + 1u, 0);
  textureStore(shift, at, id.z, vec4f(a.x, a.z, a.y, a.w));
  textureStore(slope, at, id.z, b);
  textureStore(moment, at, id.z, vec4f(b.x * b.x, b.y * b.y, b.x * b.y, 0.0));
}
`;

/** A map's next mip: each texel the mean of the four under it. */
export const HALVE_MAP_SHADER = /* wgsl */ `
@group(0) @binding(0) var source: texture_2d_array<f32>;
@group(0) @binding(1) var to: texture_storage_2d_array<rgba16float, write>;

@compute @workgroup_size(8, 8)
fn halve(@builtin(global_invocation_id) id: vec3u) {
  let at = vec2i(id.xy) * 2;
  let sum = textureLoad(source, at, id.z, 0)
    + textureLoad(source, at + vec2i(1, 0), id.z, 0)
    + textureLoad(source, at + vec2i(0, 1), id.z, 0)
    + textureLoad(source, at + vec2i(1, 1), id.z, 0);
  textureStore(to, vec2i(id.xy), id.z, sum * 0.25);
}
`;

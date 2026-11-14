// The wave field's first pass: every wave of every cascade turned to the
// clock's moment, and from it the spectra of the surface's height, its
// sideways shift and their gradients, paired two real fields to a complex one.

import super::wave_complex::{times, paired};
import super::wave_field_numbers::{TAU, FIELD_TILE, FIELD_HOUR, FIELD_CHOP};

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
  return select(f32(i) - f32(FIELD_TILE), f32(i), i < FIELD_TILE / 2u);
}

@compute @workgroup_size(8, 8)
fn evolve(@builtin(global_invocation_id) id: vec3u) {
  let cascade = id.z;
  let at = vec2i(id.xy);
  let wave = textureLoad(waves, at, cascade, 0);
  let n = textureLoad(turns, at, cascade, 0).r;
  // The wave's turns so far this hour, the whole seconds' share in integers
  // so that a late second is as exact as an early one.
  let whole = f32((n * moment.whole) % FIELD_HOUR) / f32(FIELD_HOUR);
  let phase = TAU * fract(whole + f32(n) * moment.part / f32(FIELD_HOUR));
  let spin = vec2f(cos(phase), sin(phase));
  let h = times(wave.xy, vec2f(spin.x, -spin.y)) + times(wave.zw, spin);
  let k = TAU * vec2f(bin(id.x), bin(id.y)) / moment.sides[cascade];
  let size = length(k);
  let unit = select(vec2f(0.0), k / size, size > 0.0);
  let ih = vec2f(-h.y, h.x);
  let shift = FIELD_CHOP * unit;
  // Height Y, shift D = -i k/|k| h, and their gradients along x and z.
  let dx = -shift.x * ih;
  let dz = -shift.y * ih;
  let yx = k.x * ih;
  let yz = k.y * ih;
  let dxx = shift.x * k.x * h;
  let dzz = shift.y * k.y * h;
  let dxz = shift.x * k.y * h;
  textureStore(field, at, 2u * cascade, vec4f(paired(dx, dz), paired(h, dxz)));
  textureStore(
    field,
    at,
    2u * cascade + 1u,
    vec4f(paired(yx, yz), paired(dxx, dzz)),
  );
}

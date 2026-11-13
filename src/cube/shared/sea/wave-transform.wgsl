// One stage of the wave field's radix-2 inverse transform along one axis;
// sixteen of them take a tile from wavenumbers to metres. The first stage
// along an axis reads its input in bit-reversed order, so no pass is spent on
// reordering.

import super::wave_complex::times;
import super::wave_field_numbers::{TAU, FIELD_TILE};

struct Stage {
  stage: u32,
  /// 0 along x, 1 along z.
  axis: u32,
}

@group(0) @binding(0) var<uniform> now: Stage;
@group(0) @binding(1) var source: texture_2d_array<f32>;
@group(0) @binding(2) var to: texture_storage_2d_array<rgba32float, write>;

fn reversed(i: u32) -> u32 {
  return reverseBits(i) >> (32u - firstTrailingBit(FIELD_TILE));
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

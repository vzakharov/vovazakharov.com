// Generated from wave-lay.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/cube/shared/shader';

export const WAVE_LAY = wgsl(
  'cube/widgets/outdoors/scene/wave/field/lib/wave-lay',
  /* wgsl */ `
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
`,
);

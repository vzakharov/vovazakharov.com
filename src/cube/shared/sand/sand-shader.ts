import { type Wgsl, wgsl } from '@/cube/entities/theme/kit';

import { sandMaterial, SWASH_TOP } from './sand-material';
import { SAND_MESH } from './sand-mesh';
import { RIPPLES, WIND } from './sand-relief';

/** Metres under still water below which the sea always covers the sand. */
const SUNK = 0.9;

/**
 * The sand layer's two stages. `seam` is the outdoor scene's shared piece: the
 * `frame` uniforms, `islandHeight`, `waterLevel`, `cubeShadow`, `skyRadiance`
 * and `aerial`.
 */
export const sandShader = (seam: Wgsl): Wgsl =>
  wgsl(
    'sand-shader',
    /* wgsl */ `
struct SandVertex {
  @builtin(position) clip: vec4f,
  @location(0) at: vec3f,
  /// x metres over still water of the walked-on shape, yz its slope.
  @location(1) shape: vec3f,
  @location(2) wet: vec2f,
}

@vertex
fn sandVertex(@builtin(vertex_index) index: u32) -> SandVertex {
  let ring = f32(index / ${SAND_MESH.spokes}u);
  let bearing = f32(index % ${SAND_MESH.spokes}u) * ${(2 * Math.PI) / SAND_MESH.spokes};
  let radius = ${SAND_MESH.inner} * (pow(${SAND_MESH.growth}, ring) - 1.0);
  let xz = frame.eye.xz + radius * vec2f(cos(bearing), sin(bearing));
  let h = islandHeight(xz);
  let reach = 0.04 + 0.01 * radius;
  let slope = vec2f(
    islandHeight(xz + vec2f(reach, 0.0)) - h,
    islandHeight(xz + vec2f(0.0, reach)) - h,
  ) / reach;

  // The small relief lifts the mesh only where its triangles are finer than it.
  let spacing = (radius + ${SAND_MESH.inner}) * ${Math.log(SAND_MESH.growth)};
  var lift = sandHummocks(xz, h).height * (1.0 - smoothstep(0.04, 0.12, spacing));
  let fine = 1.0 - smoothstep(${RIPPLES.wavelength / 9}, ${RIPPLES.wavelength / 4}, spacing);
  if (fine > 0.0) {
    lift += fine * sandRipples(xz, h, frame.sun.xyz).relief.height;
  }

  var out: SandVertex;
  out.at = vec3f(xz.x, h + lift, xz.y);
  out.shape = vec3f(h, slope);
  out.wet = vec2f(select(0.0, 1.0, h < 0.0));
  if (h > -0.3 && h < ${SWASH_TOP}) {
    out.wet = sandWetness(xz, h, frame.clock.x);
  }
  out.clip = frame.viewProjection * vec4f(out.at, 1.0);
  return out;
}

struct SandTargets {
  @location(0) light: vec4f,
  @location(1) mirror: vec4f,
  @location(2) plane: vec4f,
}

@fragment
fn sandFragment(in: SandVertex) -> SandTargets {
  let acrossX = dpdx(in.at.xz);
  let acrossY = dpdy(in.at.xz);
  if (in.shape.x < -${SUNK}) {
    discard;
  }
  let wind = vec2f(${WIND[0]}, ${WIND[1]});
  let toEye = frame.eye.xyz - in.at;
  let far = length(toEye);
  var point: SandPoint;
  point.at = in.at;
  point.h = in.shape.x;
  point.slope = in.shape.yz;
  point.wet = in.wet;
  point.view = toEye / far;
  point.px = sqrt(length(acrossX) * length(acrossY));
  point.alongWind = abs(dot(acrossX, wind)) + abs(dot(acrossY, wind));
  point.sun = cubeShadow(in.at);
  let light = aerial(sandLight(point, frame.sun.xyz), frame.eye.xyz, in.at);
  return SandTargets(vec4f(light, far), vec4f(0.0), vec4f(0.0));
}
`,
    sandMaterial(seam),
    seam,
  );

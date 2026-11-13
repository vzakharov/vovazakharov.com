import { wgsl } from '../lib/wgsl';
import { AERIAL, CUBE_SHADOW, ISLAND_HEIGHT, OUTDOOR_STAGE } from '../outside';
import { SAND_MATERIAL, SWASH_TOP } from './sand-material';
import { SAND_MESH } from './sand-mesh';
import { RIPPLES, WIND } from './sand-relief';

/** Metres under still water below which the sea always covers the sand. */
const SUNK = 0.9;

/**
 * The sand layer's two stages, `vertexMain` and `fragmentMain`: the ring mesh
 * placed round the eye on the island's shape, and each pixel of it lit.
 */
export const SAND_SHADER = wgsl(
  'sand-shader',
  /* wgsl */ `
struct SandVertex {
  @builtin(position) clip: vec4f,
  @location(0) at: vec3f,
  /// x metres over still water of the walked-on shape, yz its slope.
  @location(1) shape: vec3f,
}

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> SandVertex {
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
  out.clip = clipOf(out.at);
  return out;
}

@fragment
fn fragmentMain(in: SandVertex) -> Scene {
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
  // A swash sheet's edge is sharper than a triangle is small, so the sea is
  // asked at each pixel.
  point.wet = vec2f(select(0.0, 1.0, in.shape.x < 0.0));
  if (in.shape.x > -0.3 && in.shape.x < ${SWASH_TOP}) {
    point.wet = sandWetness(in.at.xz, in.shape.x, frame.clock.x);
  }
  point.view = toEye / far;
  point.px = sqrt(length(acrossX) * length(acrossY));
  point.alongWind = abs(dot(acrossX, wind)) + abs(dot(acrossY, wind));
  // The shadow's edge rides the hummocks the mesh is too coarse to carry.
  let lifted = in.shape.x + sandHummocks(in.at.xz, in.shape.x).height;
  point.sun = cubeShadow(vec3f(in.at.x, max(in.at.y, lifted), in.at.z));
  return lit(aerial(sandLight(point, frame.sun.xyz), -point.view, far), far);
}
`,
  SAND_MATERIAL,
  OUTDOOR_STAGE,
  ISLAND_HEIGHT,
  CUBE_SHADOW,
  AERIAL,
);

// The sand layer's two stages, `vertexMain` and `fragmentMain`: the ring mesh
// placed round the eye on the island's shape, and each pixel of it lit. An eye
// under the still sea sees the bed through the water, whose body takes it over
// with distance, lit by what the water over it lets down.

import package::cube::widgets::outdoors::stage::lib::aerial::aerial;
import package::cube::widgets::outdoors::stage::lib::cube_shadow::cubeShadow;
import package::cube::entities::island::land::model::island_height::islandHeight;
import package::cube::widgets::outdoors::stage::lib::outdoor_frame::frame;
import package::cube::widgets::outdoors::stage::lib::outdoor_stage::{Scene, clipOf, lit};
import package::cube::widgets::outdoors::stage::lib::water_body::{kept, throughWater, underStill};
import package::cube::widgets::outdoors::surface::sand::material::lib::sand_material::{SWASH_TOP, SandPoint, sandWetness, sandLight};
import super::sand_mesh_numbers::{SAND_SPOKES, SAND_SPOKE_TURN, SAND_INNER, SAND_GROWTH, SAND_GROWTH_LOG};
import package::cube::widgets::outdoors::surface::beach::lib::sand_relief::{RIPPLE_LENGTH, sandHummocks, sandRipples};
import package::cube::widgets::outdoors::surface::beach::lib::sand_relief_numbers::SAND_WIND;

/// Metres under still water below which the sea always covers the sand from
/// an eye over the still sea.
const SAND_SUNK = 0.9;

struct SandVertex {
  @builtin(position) clip: vec4f,
  @location(0) at: vec3f,
  /// x metres over still water of the walked-on shape, yz its slope.
  @location(1) shape: vec3f,
}

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> SandVertex {
  let ring = f32(index / SAND_SPOKES);
  let bearing = f32(index % SAND_SPOKES) * SAND_SPOKE_TURN;
  let radius = SAND_INNER * (pow(SAND_GROWTH, ring) - 1.0);
  let xz = frame.eye.xz + radius * vec2f(cos(bearing), sin(bearing));
  let h = islandHeight(xz);
  let reach = 0.04 + 0.01 * radius;
  let slope =
    vec2f(
      islandHeight(xz + vec2f(reach, 0.0)) - h,
      islandHeight(xz + vec2f(0.0, reach)) - h,
    ) / reach;

  // The small relief lifts the mesh only where its triangles are finer than it.
  let spacing = (radius + SAND_INNER) * SAND_GROWTH_LOG;
  var lift =
    sandHummocks(xz, h).height * (1.0 - smoothstep(0.04, 0.12, spacing));
  let fine =
    1.0 - smoothstep(RIPPLE_LENGTH / 9.0, RIPPLE_LENGTH / 4.0, spacing);
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
  let drowned = frame.eye.y <= 0.0;
  if (in.shape.x < -SAND_SUNK && !drowned) {
    discard;
  }
  let wind = SAND_WIND;
  let toEye = frame.eye.xyz - in.at;
  let far = length(toEye);
  var point: SandPoint;
  point.at = in.at;
  point.h = in.shape.x;
  point.slope = in.shape.yz;
  // A swash sheet's edge is sharper than a triangle is small, so the sea is
  // asked at each pixel.
  point.wet = vec2f(select(0.0, 1.0, in.shape.x < 0.0));
  if (in.shape.x > -0.3 && in.shape.x < SWASH_TOP) {
    point.wet = sandWetness(in.at.xz, in.shape.x, frame.clock.x);
  }
  point.view = toEye / far;
  point.px = sqrt(length(acrossX) * length(acrossY));
  point.alongWind = abs(dot(acrossX, wind)) + abs(dot(acrossY, wind));
  // The shadow's edge rides the hummocks the mesh is too coarse to carry.
  let lifted = in.shape.x + sandHummocks(in.at.xz, in.shape.x).height;
  point.sun = cubeShadow(vec3f(in.at.x, max(in.at.y, lifted), in.at.z));
  let shown = sandLight(point, frame.sun.xyz);
  if (drowned) {
    let wetted = shown * kept(-in.at.y);
    return lit(throughWater(wetted, underStill(frame.eye.xyz, in.at)), far);
  }
  return lit(aerial(shown, -point.view, far), far);
}

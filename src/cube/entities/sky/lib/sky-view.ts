/// <reference types="@webgpu/types" />

import { SUN_DIR, SUN_WHITE } from '../model/sun';
import { AIR_WGSL, f } from './air';
import { type AirTables, compiled, COVER_WGSL, SKY_FORMAT } from './tables';

/** The clear sky's table: half a turn from the sun across, nadir to zenith up. */
export const SKY_VIEW_SIZE = 256;

/**
 * Where the clear sky's table holds a direction, and the direction a texel
 * holds: the turn from the sun's side across, and the elevation up, its rows
 * crowded toward the horizon, where the sky changes fastest.
 */
export const SKY_VIEW_WGSL = /* wgsl */ `
const SKY_VIEW_SIZE = ${f(SKY_VIEW_SIZE)};

fn skyViewUv(dir: vec3f, sun: vec3f) -> vec2f {
  let flat = normalize(dir.xz + vec2f(1e-9, 0.0));
  let turn = acos(clamp(dot(flat, normalize(sun.xz)), -1.0, 1.0));
  let lift = asin(clamp(dir.y, -1.0, 1.0));
  let at = vec2f(turn / PI, 0.5 + 0.5 * sign(lift) * sqrt(abs(lift) / (0.5 * PI)));
  return (at * (SKY_VIEW_SIZE - 1.0) + 0.5) / SKY_VIEW_SIZE;
}

/// The clear sky along \`dir\`, in the scene's units.
fn clearSky(dir: vec3f, sun: vec3f) -> vec3f {
  let uv = skyViewUv(dir, sun);
  return textureSampleLevel(skyView, tableSampler, vec2f(uv.x, 1.0 - uv.y), 0.0).rgb;
}
`;

const STEPS = 48;

const SHADER = /* wgsl */ `
@group(0) @binding(0) var transmittanceTable: texture_2d<f32>;
@group(0) @binding(1) var scatterTable: texture_2d<f32>;
@group(0) @binding(2) var tableSampler: sampler;

${AIR_WGSL}
${COVER_WGSL}

const SUN_LIFT = ${f(SUN_DIR[1])};
const STEPS = ${String(STEPS)};

/// \`model/sky-light.ts\`'s clearSky, on the GPU: the same march, slice by slice.
@fragment
fn skyViewMain(in: Cover) -> @location(0) vec4f {
  let at = (vec2f(in.uv.x, 1.0 - in.uv.y) * SKY_VIEW_SIZE - 0.5) / (SKY_VIEW_SIZE - 1.0);
  let side = at.y * 2.0 - 1.0;
  let lift = sign(side) * side * side * 0.5 * PI;
  let mu = sin(lift);
  let between = cos(lift) * cos(at.x * PI) * sqrt(1.0 - SUN_LIFT * SUN_LIFT) + mu * SUN_LIFT;
  let rayleigh = rayleighPhase(between);
  let mie = miePhase(between, MIE_G);

  let ground = toGround(EYE_RADIUS, mu);
  let reach = select(toTop(EYE_RADIUS, mu), ground, ground >= 0.0);
  var light = vec3f(0.0);
  var through = vec3f(1.0);
  var before = 0.0;
  for (var i = 0; i < STEPS; i++) {
    let share = f32(i + 1) / f32(STEPS);
    let after = reach * share * share;
    let width = after - before;
    let t = before + width * 0.5;
    before = after;
    let radius = sqrt(max(0.0, t * t + 2.0 * EYE_RADIUS * mu * t + EYE_RADIUS * EYE_RADIUS));
    let sunMu = (EYE_RADIUS * SUN_LIFT + t * between) / radius;
    let air = airAt(max(0.0, radius - RG));
    let source = (air.rayleigh * rayleigh + air.mie * mie) * sunTransmittance(radius, sunMu)
      + (air.rayleigh + air.mie) * manyScattered(radius, sunMu);
    let kept = exp(-air.extinction * width);
    light += through * source * (1.0 - kept) / max(air.extinction, vec3f(1e-9));
    through *= kept;
  }
  if (ground >= 0.0) {
    light += through * groundGlow((EYE_RADIUS * SUN_LIFT + reach * between) / RG);
  }
  return vec4f(light * ${f(SUN_WHITE * Math.PI)}, 1.0);
}
`;

const SKY_VIEW_BINDINGS = /* wgsl */ `
const SKY_VIEW_SIZE = ${f(SKY_VIEW_SIZE)};
`;

/** Draws the clear sky's table once, from the atmosphere's tables. */
export async function skyView(
  device: GPUDevice,
  tables: AirTables,
): Promise<GPUTexture> {
  const shader = await compiled(
    device,
    'sky view',
    SKY_VIEW_BINDINGS + SHADER,
  );
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module: shader, entryPoint: 'coverMain' },
    fragment: {
      module: shader,
      entryPoint: 'skyViewMain',
      targets: [{ format: SKY_FORMAT }],
    },
  });
  const texture = device.createTexture({
    size: [SKY_VIEW_SIZE, SKY_VIEW_SIZE],
    format: SKY_FORMAT,
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
  });
  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [
      { view: texture.createView(), loadOp: 'clear', storeOp: 'store' },
    ],
  });
  pass.setPipeline(pipeline);
  pass.setBindGroup(
    0,
    device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: tables.transmittance.createView() },
        { binding: 1, resource: tables.scatter.createView() },
        { binding: 2, resource: tables.sampler },
      ],
    }),
  );
  pass.draw(3);
  pass.end();
  device.queue.submit([encoder.finish()]);
  return texture;
}

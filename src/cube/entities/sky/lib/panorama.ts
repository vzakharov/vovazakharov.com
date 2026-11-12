/// <reference types="@webgpu/types" />

import { CLOUDS, driftAt, grainRiseAt } from '../model/cloud-field';
import { SUN_DIR } from '../model/sun';
import { AIR_WGSL, f, vec3 } from './air';
import { CLOUD_WGSL } from './clouds';
import type { CloudNoise } from './noise';
import { SKY_VIEW_WGSL } from './sky-view';
import { type AirTables, compiled, layoutOf, SKY_FORMAT } from './tables';

/**
 * The clouds as seen from the island, all the way round and from the horizon
 * up to `lift`: `width` by `height` texels, so one is about a pixel and a
 * half of the widest canvas.
 */
export const PANORAMA = {
  width: 6144,
  height: 768,
  lift: Math.PI / 4,
  /** Seconds between two paintings of it; a whole number of them fill the hour. */
  slot: 6,
} as const;

/** Kilometres from the eye to a cloud, one number a texel. */
const DEPTH_FORMAT: GPUTextureFormat = 'r16float';

/** Where the panorama holds a direction: the turn across, the horizon at the bottom. */
export const PANORAMA_WGSL = /* wgsl */ `
const PANORAMA_LIFT = ${f(PANORAMA.lift)};

fn panoramaUv(dir: vec3f) -> vec2f {
  let turn = atan2(dir.z, dir.x) / (2.0 * PI);
  return vec2f(turn, 1.0 - asin(clamp(dir.y, -1.0, 1.0)) / PANORAMA_LIFT);
}
`;

const SHADER = /* wgsl */ `
@group(0) @binding(0) var<uniform> drifted: vec4f;
@group(0) @binding(1) var transmittanceTable: texture_2d<f32>;
@group(0) @binding(2) var scatterTable: texture_2d<f32>;
@group(0) @binding(3) var tableSampler: sampler;
@group(0) @binding(4) var skyView: texture_2d<f32>;
@group(0) @binding(5) var shape: texture_3d<f32>;
@group(0) @binding(6) var grain: texture_3d<f32>;
@group(0) @binding(7) var weather: texture_2d<f32>;
@group(0) @binding(8) var noiseSampler: sampler;

${AIR_WGSL}
${SKY_VIEW_WGSL}
${CLOUD_WGSL}

const SUN = ${vec3(SUN_DIR)};
const SIZE = vec2f(${f(PANORAMA.width)}, ${f(PANORAMA.height)});
const STEPS = 900;
/// The march's two strides, each this many km or this share of the way gone
/// if that is more: \`SEEK\` looks for a cloud, \`TREAD\` crosses one, short
/// enough that a stride of the densest cloud still lets light through.
const SEEK = 0.07;
const SEEK_GROWS = 0.006;
const TREAD = 0.014;
const TREAD_GROWS = 0.0011;

@vertex
fn paintVertex(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
  let corner = vec2f(f32((index << 1u) & 2u), f32(index & 2u));
  return vec4f(corner * 2.0 - 1.0, 0.0, 1.0);
}

struct Painted {
  /// rgb: the cloud's light, already dimmed by its own cover; a: what shows through.
  @location(0) cloud: vec4f,
  @location(1) away: vec4f,
};

/// Kilometres from the eye along a ray of cosine \`mu\` to the sphere \`h\` km up.
fn toShell(mu: f32, h: f32) -> f32 {
  let r = RG + h;
  return -EYE_RADIUS * mu + sqrt(max(0.0, EYE_RADIUS * EYE_RADIUS * (mu * mu - 1.0) + r * r));
}

@fragment
fn paintMain(@builtin(position) at: vec4f) -> Painted {
  let uv = at.xy / SIZE;
  let turn = uv.x * 2.0 * PI;
  let lift = (1.0 - uv.y) * ${f(PANORAMA.lift)};
  let dir = vec3f(cos(lift) * cos(turn), sin(lift), cos(lift) * sin(turn));
  let towardSun = dot(dir, SUN);

  let enter = toShell(dir.y, CLOUD_BASE - 0.15);
  let leave = min(toShell(dir.y, CLOUD_TOP), CLOUD_REACH);
  // Each texel starts its march a different fraction of a stride in, so
  // the strides' edges fall as grain a texel wide rather than as rings.
  let dither = fract(52.9829189 * fract(dot(at.xy, vec2f(0.06711056, 0.00583715))));
  var t = enter + dither * max(SEEK, enter * SEEK_GROWS);
  var through = 1.0;
  var light = vec3f(0.0);
  var reached = 0.0;
  let fog = clearSky(dir, SUN);
  // Whether the march is inside a cloud, and how many strides it has gone
  // without meeting any since.
  var treading = false;
  var empty = 0;

  for (var i = 0; i < STEPS && t < leave && through > 0.01; i++) {
    let seek = max(SEEK, t * SEEK_GROWS);
    let least = max(TREAD, t * TREAD_GROWS);
    var tread = least;
    let p = dir * t;
    let h = heightOf(p);
    let field = inField(p, h);
    let w = weatherAt(field, t);
    if (w.x < 0.01) {
      treading = false;
      t += seek * 3.0;
      continue;
    }
    let lod = log2(least / TREAD) * 0.6;
    let density = cloudDensity(field, w, lod, true);
    if (!treading) {
      if (density > 0.0) {
        // Found one: go back a stride and cross its edge finely.
        treading = true;
        empty = 0;
        t -= seek - tread * dither;
      } else {
        t += seek;
      }
      continue;
    }
    if (density > 0.0) {
      empty = 0;
      // Thin cloud is crossed in longer strides: each takes about the same
      // share of the light, so a ray through haze does not run out of them.
      tread = clamp(0.45 / (density * CLOUD_EXTINCTION), least, seek);
      let up = normalize(p + vec3f(0.0, EYE_RADIUS, 0.0));
      let rise = clamp((h - CLOUD_BASE) / (CLOUD_TOP - CLOUD_BASE), 0.0, 1.0);
      let glow = cloudLight(h, depthToSun(p, SUN, lod), towardSun, dot(SUN, up), rise, density);
      let kept = exp(-density * CLOUD_EXTINCTION * tread);
      let air = airBetween(t, h);
      let covers = through * (1.0 - kept);
      light += covers * (glow * air + fog * (1.0 - air));
      reached += covers * t;
      through *= kept;
    } else {
      empty++;
      treading = f32(empty) * tread < seek;
    }
    t += tread;
  }

  let covered = 1.0 - through;
  var out: Painted;
  out.cloud = vec4f(light, through);
  // Clear sky keeps the slab's own distance, so the field of distances a
  // warp reads has no cliff at a cloud's edge.
  let slab = toShell(dir.y, 0.5 * (CLOUD_BASE + CLOUD_TOP));
  out.away = vec4f(mix(slab, reached / max(covered, 1e-4), smoothstep(0.0, 0.3, covered)), 0.0, 0.0, 1.0);
  return out;
}
`;

type Painting = {
  cloud: GPUTexture;
  away: GPUTexture;
  views: readonly [GPUTextureView, GPUTextureView];
  drifted: GPUBuffer;
  group: GPUBindGroup;
  /** Which slot of the hour this holds, and how many of its columns are painted. */
  slot: number;
  done: number;
};

/** What a frame shows of the two paintings: each one's age in seconds, and the newer's share. */
export type CloudMoment = {
  ages: readonly [number, number];
  shares: readonly [number, number];
};

export type Panorama = {
  /** Paints what the moment needs and says how the two paintings blend at it. */
  advance: (encoder: GPUCommandEncoder, seconds: number) => CloudMoment;
  clouds: readonly [GPUTextureView, GPUTextureView];
  aways: readonly [GPUTextureView, GPUTextureView];
  dispose: () => void;
};

const SLOTS = 3600 / PANORAMA.slot;
/** The share of a slot the next painting takes to paint; it fades in over the rest's second half. */
const PAINTED_BY = 0.45;
const smooth = (x: number): number => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

/**
 * Two paintings of the clouds, a slot apart. The older one is shown, warped
 * by the wind to the moment; the newer is painted a few columns a frame
 * behind it and fades in once whole, then the older one's texture takes the
 * painting after. Which slot each holds is a function of the clock alone.
 */
export async function createPanorama(
  device: GPUDevice,
  tables: AirTables,
  skyView: GPUTexture,
  noise: CloudNoise,
  scale = 1,
): Promise<Panorama> {
  const width = Math.round(PANORAMA.width * scale);
  const height = Math.round(PANORAMA.height * scale);
  const shader = await compiled(
    device,
    'cloud panorama',
    SHADER.replace(
      `const SIZE = vec2f(${f(PANORAMA.width)}, ${f(PANORAMA.height)});`,
      `const SIZE = vec2f(${f(width)}, ${f(height)});`,
    ),
  );
  const layout = layoutOf(device, [
    'uniform',
    'texture',
    'texture',
    'sampler',
    'texture',
    'volume',
    'volume',
    'texture',
    'sampler',
  ]);
  const pipeline = await device.createRenderPipelineAsync({
    layout: device.createPipelineLayout({ bindGroupLayouts: [layout] }),
    vertex: { module: shader, entryPoint: 'paintVertex' },
    fragment: {
      module: shader,
      entryPoint: 'paintMain',
      targets: [{ format: SKY_FORMAT }, { format: DEPTH_FORMAT }],
    },
  });
  const usage =
    GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING;
  const painting = (): Painting => {
    const cloud = device.createTexture({
      size: [width, height],
      format: SKY_FORMAT,
      usage,
    });
    const away = device.createTexture({
      size: [width, height],
      format: DEPTH_FORMAT,
      usage,
    });
    const drifted = device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const resources: GPUBindingResource[] = [
      { buffer: drifted },
      tables.transmittance.createView(),
      tables.scatter.createView(),
      tables.sampler,
      skyView.createView(),
      noise.shape.createView(),
      noise.grain.createView(),
      noise.weather.createView(),
      noise.sampler,
    ];
    return {
      cloud,
      away,
      views: [cloud.createView(), away.createView()],
      drifted,
      group: device.createBindGroup({
        layout,
        entries: resources.map((resource, binding) => ({ binding, resource })),
      }),
      slot: -1,
      done: 0,
    };
  };
  const paintings = [painting(), painting()] as const;

  /** Paints `into` for `slot` as far as `share` of its width. */
  const paint = (
    encoder: GPUCommandEncoder,
    into: Painting,
    slot: number,
    share: number,
  ): void => {
    if (into.slot !== slot) {
      into.slot = slot;
      into.done = 0;
      const seconds = slot * PANORAMA.slot;
      device.queue.writeBuffer(
        into.drifted,
        0,
        new Float32Array([driftAt(seconds), grainRiseAt(seconds), 0, 0]),
      );
    }
    const upTo = Math.min(width, Math.ceil(share * width));
    if (upTo <= into.done) return;
    const pass = encoder.beginRenderPass({
      colorAttachments: into.views.map((view) => ({
        view,
        loadOp: 'load' as const,
        storeOp: 'store' as const,
      })),
    });
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, into.group);
    pass.setScissorRect(into.done, 0, upTo - into.done, height);
    pass.draw(3);
    pass.end();
    into.done = upTo;
  };

  return {
    advance: (encoder, seconds) => {
      const slot = Math.floor(seconds / PANORAMA.slot) % SLOTS;
      const phase = seconds / PANORAMA.slot - Math.floor(seconds / PANORAMA.slot);
      const shown = slot % 2;
      const [older, newer] =
        shown === 0 ? paintings : ([paintings[1], paintings[0]] as const);
      paint(encoder, older, slot, 1);
      paint(encoder, newer, (slot + 1) % SLOTS, phase >= 0.5 ? 1 : phase / PAINTED_BY);
      const fresh = smooth((phase - 0.5) * 2);
      const age = phase * PANORAMA.slot;
      return shown === 0
        ? { ages: [age, age - PANORAMA.slot], shares: [1 - fresh, fresh] }
        : { ages: [age - PANORAMA.slot, age], shares: [fresh, 1 - fresh] };
    },
    clouds: [paintings[0].views[0], paintings[1].views[0]],
    aways: [paintings[0].views[1], paintings[1].views[1]],
    dispose: () => {
      for (const { cloud, away, drifted } of paintings) {
        cloud.destroy();
        away.destroy();
        drifted.destroy();
      }
    },
  };
}

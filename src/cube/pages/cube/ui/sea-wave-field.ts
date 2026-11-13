/// <reference types="@webgpu/types" />

import type { CanDispose, Timed } from '@/kernel/shared/typings';

import {
  amplitudesOf,
  CASCADES,
  EVOLVE_SHADER,
  FIELD_LAYERS,
  HALVE_MAP_SHADER,
  LAY_SHADER,
  type Sea,
  TILE,
  TRANSFORM_SHADER,
} from '@/cube/shared/sea';

/** The maps a wave field keeps current; `LAY_SHADER` says what each holds. */
const MAPS = ['shift', 'slope', 'moment'] as const;
type MapName = (typeof MAPS)[number];

const MAP_FORMAT = 'rgba16float';
const STAGES = Math.log2(TILE);
const MIPS = STAGES + 1;
const GROUPS = TILE / 8;

/**
 * The open sea's waves at one moment, as textures: one array layer per
 * cascade, mipped, each tile repeating over its cascade's side.
 */
export type WaveField = CanDispose &
  Record<MapName, GPUTextureView> & {
    /** Encodes the passes that bring the maps to `seconds` into the hour. */
    run: (encoder: GPUCommandEncoder, clock: Timed) => void;
  };

const whole = (texture: GPUTexture): GPUTextureView =>
  texture.createView({ dimension: '2d-array' });

const level = (texture: GPUTexture, mip: number): GPUTextureView =>
  texture.createView({
    dimension: '2d-array',
    baseMipLevel: mip,
    mipLevelCount: 1,
  });

export function createWaveField(
  device: GPUDevice,
  seas: readonly Sea[],
): WaveField {
  const cascades = CASCADES.length;
  const array = (
    format: GPUTextureFormat,
    layers: number,
    usage: number,
    mipLevelCount = 1,
  ): GPUTexture =>
    device.createTexture({
      size: [TILE, TILE, layers],
      format,
      usage,
      mipLevelCount,
    });

  const waves = array(
    'rgba32float',
    cascades,
    GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  );
  const turns = array(
    'r32uint',
    cascades,
    GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  );
  for (const index of CASCADES.keys()) {
    const amplitudes = amplitudesOf(seas, index);
    const layer = { width: TILE, height: TILE };
    device.queue.writeTexture(
      { texture: waves, origin: [0, 0, index] },
      amplitudes.waves,
      { bytesPerRow: TILE * 16 },
      layer,
    );
    device.queue.writeTexture(
      { texture: turns, origin: [0, 0, index] },
      amplitudes.turns,
      { bytesPerRow: TILE * 4 },
      layer,
    );
  }

  const working =
    GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING;
  const fields = [0, 1].map(() => array('rgba32float', FIELD_LAYERS, working));
  const maps = MAPS.map(() => array(MAP_FORMAT, cascades, working, MIPS));

  const compute = (code: string, entryPoint: string): GPUComputePipeline =>
    device.createComputePipeline({
      layout: 'auto',
      compute: { module: device.createShaderModule({ code }), entryPoint },
    });
  const bound = (
    pipeline: GPUComputePipeline,
    resources: readonly GPUBindingResource[],
  ): GPUBindGroup =>
    device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: resources.map((resource, binding) => ({ binding, resource })),
    });
  const uniform = (data: ArrayBuffer): GPUBuffer => {
    const buffer = device.createBuffer({
      size: data.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(buffer, 0, data);
    return buffer;
  };

  // struct Moment: whole u32, part f32, 8 bytes of padding, sides vec4f.
  const moment = new ArrayBuffer(32);
  new Float32Array(moment, 16, 4).set(CASCADES.map(({ tileSide }) => tileSide));
  const momentBuffer = uniform(moment);

  const evolve = compute(EVOLVE_SHADER, 'evolve');
  const [ping, pong] = fields;
  if (ping === undefined || pong === undefined) throw new Error('No fields');
  const evolving = bound(evolve, [
    { buffer: momentBuffer },
    whole(waves),
    whole(turns),
    whole(ping),
  ]);

  const transform = compute(TRANSFORM_SHADER, 'transform');
  const stageBuffers: GPUBuffer[] = [];
  // Sixteen stages, an even count, so the last one lands back in `ping`.
  const transforming = Array.from({ length: STAGES * 2 }, (_, index) => {
    const buffer = uniform(
      new Uint32Array([index % STAGES, Math.floor(index / STAGES)]).buffer,
    );
    stageBuffers.push(buffer);
    const [from, to] = index % 2 === 0 ? [ping, pong] : [pong, ping];
    return bound(transform, [{ buffer }, whole(from), whole(to)]);
  });

  const lay = compute(LAY_SHADER, 'lay');
  const laying = bound(lay, [whole(ping), ...maps.map((map) => level(map, 0))]);

  const halve = compute(HALVE_MAP_SHADER, 'halve');
  const halving = maps.flatMap((map) =>
    Array.from({ length: MIPS - 1 }, (_, mip) => ({
      group: bound(halve, [level(map, mip), level(map, mip + 1)]),
      groups: Math.max(1, GROUPS >> (mip + 1)),
    })),
  );

  const [shift, slope, momentMap] = maps.map((map) => whole(map));
  if (shift === undefined || slope === undefined || momentMap === undefined) {
    throw new Error('No maps');
  }

  return {
    shift,
    slope,
    moment: momentMap,
    run: (encoder, { seconds }) => {
      new Uint32Array(moment, 0, 1)[0] = Math.floor(seconds);
      new Float32Array(moment, 4, 1)[0] = seconds - Math.floor(seconds);
      device.queue.writeBuffer(momentBuffer, 0, moment, 0, 8);
      const pass = encoder.beginComputePass();
      pass.setPipeline(evolve);
      pass.setBindGroup(0, evolving);
      pass.dispatchWorkgroups(GROUPS, GROUPS, cascades);
      pass.setPipeline(transform);
      for (const group of transforming) {
        pass.setBindGroup(0, group);
        pass.dispatchWorkgroups(GROUPS, GROUPS, FIELD_LAYERS);
      }
      pass.setPipeline(lay);
      pass.setBindGroup(0, laying);
      pass.dispatchWorkgroups(GROUPS, GROUPS, cascades);
      pass.setPipeline(halve);
      for (const { group, groups } of halving) {
        pass.setBindGroup(0, group);
        pass.dispatchWorkgroups(groups, groups, cascades);
      }
      pass.end();
    },
    dispose: () => {
      for (const texture of [waves, turns, ...fields, ...maps]) {
        texture.destroy();
      }
      for (const buffer of [momentBuffer, ...stageBuffers]) buffer.destroy();
    },
  };
}

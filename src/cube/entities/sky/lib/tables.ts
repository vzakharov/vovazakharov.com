/// <reference types="@webgpu/types" />

import { scatterTable, type Table, transmittanceTable } from '../model/atmosphere';

/** What every texture the sky computes holds: light past white, filterable. */
export const SKY_FORMAT: GPUTextureFormat = 'rgba16float';

const scratch = new Float32Array(1);
const bits = new Uint32Array(scratch.buffer);

/** `value` as the sixteen bits of a half float, rounded to nearest. */
export function toHalf(value: number): number {
  scratch[0] = value;
  const word = bits[0] ?? 0;
  const sign = (word >>> 16) & 0x8000;
  const exponent = ((word >>> 23) & 0xff) - 127;
  const mantissa = word & 0x7fffff;
  if (exponent > 15) return sign | 0x7c00;
  if (exponent >= -14) {
    const rounded = ((exponent + 15) << 10) + ((mantissa + 0x1000) >> 13);
    return sign | Math.min(rounded, 0x7c00);
  }
  if (exponent < -25) return sign;
  return sign | (((mantissa | 0x800000) + (1 << (-exponent - 2))) >> (-exponent - 1));
}

/** `table` as a texture a shader samples with a linear sampler. */
export function tableTexture(device: GPUDevice, table: Table): GPUTexture {
  const texture = device.createTexture({
    size: [table.width, table.height],
    format: SKY_FORMAT,
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });
  device.queue.writeTexture(
    { texture },
    Uint16Array.from(table.data, toHalf),
    { bytesPerRow: table.width * 8 },
    [table.width, table.height],
  );
  return texture;
}

/** The atmosphere's two tables on the GPU, and the sampler they are read with. */
export type AirTables = {
  transmittance: GPUTexture;
  scatter: GPUTexture;
  sampler: GPUSampler;
};

export const airTables = (device: GPUDevice): AirTables => ({
  transmittance: tableTexture(device, transmittanceTable()),
  scatter: tableTexture(device, scatterTable()),
  sampler: device.createSampler({ magFilter: 'linear', minFilter: 'linear' }),
});

/** A triangle over the whole target, `uv` from its top-left corner. */
export const COVER_WGSL = /* wgsl */ `
struct Cover {
  @builtin(position) clip: vec4f,
  @location(0) uv: vec2f,
};

@vertex
fn coverMain(@builtin(vertex_index) index: u32) -> Cover {
  let corner = vec2f(f32((index << 1u) & 2u), f32(index & 2u));
  var out: Cover;
  out.clip = vec4f(corner * 2.0 - 1.0, 0.0, 1.0);
  out.uv = vec2f(corner.x, 1.0 - corner.y);
  return out;
}
`;

/** Compiles `code`, and throws with the compiler's lines if it does not. */
export async function compiled(
  device: GPUDevice,
  label: string,
  code: string,
): Promise<GPUShaderModule> {
  const shader = device.createShaderModule({ label, code });
  const { messages } = await shader.getCompilationInfo();
  const errors = messages.filter(({ type }) => type === 'error');
  if (errors.length > 0) {
    throw new Error(
      `${label}: ${errors
        .map((m) => `${String(m.lineNum)}:${String(m.linePos)} ${m.message}`)
        .join('; ')}`,
    );
  }
  return shader;
}

/** What a fragment shader's binding is, in the order a group lists them. */
export type Bound = 'texture' | 'volume' | 'sampler' | 'uniform';

/** A fragment stage's bind group layout: `bound[i]` at binding `i`. */
export const layoutOf = (
  device: GPUDevice,
  bound: readonly Bound[],
): GPUBindGroupLayout =>
  device.createBindGroupLayout({
    entries: bound.map((kind, binding) => ({
      binding,
      visibility: GPUShaderStage.FRAGMENT,
      ...(kind === 'sampler'
        ? { sampler: {} }
        : kind === 'uniform'
          ? { buffer: {} }
          : { texture: kind === 'volume' ? { viewDimension: '3d' } : {} }),
    })),
  });

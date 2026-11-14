/// <reference types="@webgpu/types" />

import { wgsl } from '@/cube/shared/shader';

import { LENS_STAGE } from './lens-stage.shader.generated';

/**
 * A vertex, field by field in buffer order: what the mesh packs, the pipeline
 * reads and the shader receives are all derived from this list. Every field
 * is 32-bit words, floats or unsigned.
 */
const FIELDS = [
  /** In the eye's frame. */
  { name: 'position', type: 'vec3f', format: 'float32x3', words: 3 },
  { name: 'normal', type: 'vec3f', format: 'float32x3', words: 3 },
  /** In the face's own room: its sides from the north-west floor corner. */
  { name: 'local', type: 'vec3f', format: 'float32x3', words: 3 },
  /** Across the face, 0 to 1: a board's place in its texture. */
  { name: 'tex', type: 'vec2f', format: 'float32x2', words: 2 },
  /** The surface's index in `SURFACES`. */
  { name: 'kind', type: 'u32', format: 'uint32', words: 1 },
  /** The room's own word, its flags, and the low bits of where it stands. */
  { name: 'seed', type: 'u32', format: 'uint32', words: 1 },
  { name: 'flags', type: 'u32', format: 'uint32', words: 1 },
  /** `0xRRGGBB`, 0 for a face with no paint. */
  { name: 'paint', type: 'u32', format: 'uint32', words: 1 },
  { name: 'cell', type: 'u32', format: 'uint32', words: 1 },
] as const satisfies ReadonlyArray<{
  name: string;
  type: string;
  format: GPUVertexFormat;
  words: number;
}>;

type FieldName = (typeof FIELDS)[number]['name'];

/** 32-bit words per vertex. */
export const VERTEX_WORDS = FIELDS.reduce((sum, { words }) => sum + words, 0);

/** The first word of field `name` within a vertex. */
export const offsetOf = (name: FieldName): number =>
  FIELDS.slice(
    0,
    FIELDS.findIndex((field) => field.name === name),
  ).reduce((sum, { words }) => sum + words, 0);

export const VERTEX_LAYOUT: GPUVertexBufferLayout = {
  arrayStride: VERTEX_WORDS * 4,
  attributes: FIELDS.map(({ name, format }, location) => ({
    shaderLocation: location,
    offset: offsetOf(name) * 4,
    format,
  })),
};

const members = (interpolated: boolean): string =>
  FIELDS.map(({ name, type }, location) => {
    const flat = interpolated && type === 'u32' ? ' @interpolate(flat)' : '';
    return `  @location(${String(location)})${flat} ${name}: ${type},`;
  }).join('\n');

/**
 * The scene's vertex stage: `VertexIn` as the buffer holds a vertex,
 * `Varying` as the fragment receives it, and `vertexMain`, which places the
 * vertex and hands every field on as it is.
 */
export const VERTEX = wgsl(
  'pages/cube/vertex',
  /* wgsl */ `
struct VertexIn {
${members(false)}
};

struct Varying {
  @builtin(position) clip: vec4f,
${members(true)}
};

@vertex
fn vertexMain(in: VertexIn) -> Varying {
  var out: Varying;
  out.clip = uniforms.viewProjection * vec4f(in.position, 1.0);
${FIELDS.map(({ name }) => `  out.${name} = in.${name};`).join('\n')}
  return out;
}
`,
  LENS_STAGE,
);

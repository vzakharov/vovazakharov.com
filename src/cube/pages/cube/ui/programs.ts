/// <reference types="@webgpu/types" />

import { VERTEX_LAYOUT } from '../lib/vertex';
import { SCENE_FORMAT } from './bloom';

/** Float depth, cleared to 0 and kept where greater: `viewProjection` reverses it. */
export const DEPTH_FORMAT: GPUTextureFormat = 'depth32float';

/**
 * A floor's pipelines: its rooms' faces and the boards hung in them, drawn
 * as scene light, and the lens that makes the frame of that.
 */
export type Program = {
  faces: GPURenderPipeline;
  boards: GPURenderPipeline;
  lens: GPURenderPipeline;
};

/** The bind group layouts every floor's pipelines share. */
type Layouts = {
  /** Group 0 of every pipeline: the frame's uniforms. */
  uniform: GPUBindGroupLayout;
  /** Group 1 of a board's: its texture and sampler. */
  board: GPUBindGroupLayout;
  /** Group 1 of a lens's: the scene, its glow and a sampler. */
  lens: GPUBindGroupLayout;
};

export type Programs = {
  layouts: Layouts;
  /**
   * Resolves once the shaders of `floors` are compiled. Rejects with the
   * compiler's words on a shader that does not compile.
   */
  prepare: (floors: readonly number[]) => Promise<void>;
  /** Floor `n`'s program; throws where the floor was not prepared. */
  of: (n: number) => Program;
};

/** `shader`'s compile errors on one line, or null where it compiled. */
async function compileErrors(shader: GPUShaderModule): Promise<string | null> {
  const { messages } = await shader.getCompilationInfo();
  const errors = messages.filter(({ type }) => type === 'error');
  if (errors.length === 0) return null;
  return errors
    .map(
      ({ lineNum, linePos, message }) =>
        `${String(lineNum)}:${String(linePos)} ${message}`,
    )
    .join('; ');
}

/**
 * Each floor's program on `device`, `sourceOf` its WGSL, compiled the first
 * time the floor is prepared; a lens draws into a target of `format`.
 */
export function createPrograms(
  device: GPUDevice,
  format: GPUTextureFormat,
  sourceOf: (n: number) => string,
): Programs {
  const layouts: Layouts = {
    uniform: device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: {},
        },
      ],
    }),
    board: device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: {} },
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
      ],
    }),
    lens: device.createBindGroupLayout({
      entries: [
        { binding: 2, visibility: GPUShaderStage.FRAGMENT, texture: {} },
        { binding: 3, visibility: GPUShaderStage.FRAGMENT, texture: {} },
        { binding: 4, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
      ],
    }),
  };
  const lensLayout = device.createPipelineLayout({
    bindGroupLayouts: [layouts.uniform, layouts.lens],
  });
  const facesLayout = device.createPipelineLayout({
    bindGroupLayouts: [layouts.uniform],
  });
  const boardsLayout = device.createPipelineLayout({
    bindGroupLayouts: [layouts.uniform, layouts.board],
  });

  const compiling = new Map<number, Promise<Program>>();
  const ready = new Map<number, Program>();

  const compile = async (n: number): Promise<Program> => {
    const shader = device.createShaderModule({ code: sourceOf(n) });
    const errors = await compileErrors(shader);
    if (errors !== null) {
      throw new Error(`Floor ${String(n)}'s shader: ${errors}`);
    }
    const pipeline = async (
      layout: GPUPipelineLayout,
      fragment: string,
    ): Promise<GPURenderPipeline> =>
      device.createRenderPipelineAsync({
        layout,
        vertex: {
          module: shader,
          entryPoint: 'vertexMain',
          buffers: [VERTEX_LAYOUT],
        },
        fragment: {
          module: shader,
          entryPoint: fragment,
          targets: [{ format: SCENE_FORMAT }],
        },
        primitive: { topology: 'triangle-list', cullMode: 'back' },
        depthStencil: {
          format: DEPTH_FORMAT,
          depthWriteEnabled: true,
          depthCompare: 'greater',
        },
      });
    const [faces, boards, lens] = await Promise.all([
      pipeline(facesLayout, 'fragmentMain'),
      pipeline(boardsLayout, 'boardFragment'),
      device.createRenderPipelineAsync({
        layout: lensLayout,
        vertex: { module: shader, entryPoint: 'lensVertex' },
        fragment: {
          module: shader,
          entryPoint: 'lensFragment',
          targets: [{ format }],
        },
      }),
    ]);
    const program = { faces, boards, lens };
    ready.set(n, program);
    return program;
  };

  return {
    layouts,
    prepare: async (floors) => {
      await Promise.all(
        floors.map(async (n) => {
          const underWay = compiling.get(n) ?? compile(n);
          compiling.set(n, underWay);
          return underWay;
        }),
      );
    },
    of: (n) => {
      const program = ready.get(n);
      if (program === undefined) {
        throw new Error(`Floor ${String(n)} is drawn before it was prepared`);
      }
      return program;
    },
  };
}

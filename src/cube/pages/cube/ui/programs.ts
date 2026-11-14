/// <reference types="@webgpu/types" />

import { compiled } from '@/cube/shared/shader';

import { outsideLensSource } from '../lib/outside-lens';
import { VERTEX_LAYOUT } from '../lib/vertex';
import { SCENE_FORMAT } from './bloom';
import { MIRROR_FORMATS } from './reflection';

/** Float depth, cleared to 0 and kept where greater: `viewProjection` reverses it. */
export const DEPTH_FORMAT: GPUTextureFormat = 'depth32float';

/**
 * A floor's pipelines: its rooms' faces and the boards hung in them, drawn
 * as scene light and the mirrors it leaves, and the lens that makes the
 * frame of that.
 */
type Program = Lensed & {
  faces: GPURenderPipeline;
  boards: GPURenderPipeline;
};

/** What a frame is seen through: the lens pass's pipeline. */
export type Lensed = { lens: GPURenderPipeline };

/** The bind group layouts every floor's pipelines share. */
type Layouts = {
  /** Group 0 of every pipeline: the frame's uniforms. */
  uniform: GPUBindGroupLayout;
  /** Group 1 of a board's: its texture and sampler. */
  board: GPUBindGroupLayout;
  /** Group 1 of a lens's: the scene, its glow and a sampler. */
  lens: GPUBindGroupLayout;
};

/** Compiles floors' shaders ahead of their being drawn. */
export type Preparing = {
  /**
   * Resolves once the shaders of `floors` are compiled; a floor's faces are
   * uploaded only after that. Rejects with the compiler's words on a shader
   * that does not compile.
   */
  prepare: (floors: readonly number[]) => Promise<void>;
};

export type Programs = Preparing & {
  layouts: Layouts;
  /**
   * The lens of an eye outdoors, compiled the first time it is asked for;
   * rejects with the compiler's words where it does not compile.
   */
  outsideLens: () => Promise<GPURenderPipeline>;
  /** Floor `n`'s program; throws where the floor was not prepared. */
  of: (n: number) => Program;
};

/** What the scene pass writes: scene light, then what a mirror keeps. */
export const SCENE_TARGETS: GPUColorTargetState[] = [
  SCENE_FORMAT,
  ...MIRROR_FORMATS,
].map((format) => ({ format }));

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

  /** The lens pipeline of `shader`, a module built on the lens stage. */
  const lensOf = async (shader: GPUShaderModule): Promise<GPURenderPipeline> =>
    device.createRenderPipelineAsync({
      layout: lensLayout,
      vertex: { module: shader, entryPoint: 'lensVertex' },
      fragment: {
        module: shader,
        entryPoint: 'lensFragment',
        targets: [{ format }],
      },
    });

  const compileOutsideLens = async (): Promise<GPURenderPipeline> => {
    return lensOf(
      await compiled(device, "The outside lens's shader", outsideLensSource()),
    );
  };
  let outsideLens: Promise<GPURenderPipeline> | null = null;

  const compiling = new Map<number, Promise<Program>>();
  const ready = new Map<number, Program>();

  const compile = async (n: number): Promise<Program> => {
    const shader = await compiled(
      device,
      `Floor ${String(n)}'s shader`,
      sourceOf(n),
    );
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
          targets: SCENE_TARGETS,
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
      lensOf(shader),
    ]);
    const program = { faces, boards, lens };
    ready.set(n, program);
    return program;
  };

  return {
    layouts,
    outsideLens: async () => {
      outsideLens ??= compileOutsideLens();
      return outsideLens;
    },
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

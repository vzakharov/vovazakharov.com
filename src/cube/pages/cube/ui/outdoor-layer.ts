/// <reference types="@webgpu/types" />

import type { CanDispose, Labeled } from '@/kernel/shared/typings';

import type { OutdoorFrame } from '@/cube/shared/outside';
import type { Wgsl } from '@/cube/shared/shader';

/**
 * The outdoor layers in the order the scene pass draws them; the rooms and
 * what moves in them are drawn between the shell and the sea.
 */
export const LAYERS = ['sky', 'sand', 'shell', 'sea'] as const;

export type LayerName = (typeof LAYERS)[number];

/**
 * Records passes before the scene pass, each onto a screen-space target of
 * the frame about to be drawn, from `frame` alone, the canvas holding
 * `detail` of the screen's own resolution: a layer keeps nothing from one
 * frame to the next.
 */
export type Prepare = (
  encoder: GPUCommandEncoder,
  frame: OutdoorFrame,
  detail: number,
) => void;

/**
 * One drawer of the outside. `prepare` records the layer's own passes;
 * `draw` draws into the scene pass, where group 0 is already the kit's.
 */
export type OutdoorLayer = CanDispose & {
  prepare?: Prepare;
  draw: (pass: GPURenderPassEncoder) => void;
};

/** How a scene-pass pipeline meets the depth buffer. */
type Depth =
  /** Behind everything: drawn at the far plane, writing no depth. */
  | 'backdrop'
  /** A solid surface: nearest wins, and it hides what is drawn after. */
  | 'solid';

/** What a layer's scene-pass pipeline is made of, past what all of them share. */
type ScenePipeline = Labeled & {
  module: GPUShaderModule;
  depth: Depth;
  /** Entry points, `vertexMain` and `fragmentMain` unless named. */
  vertex?: string;
  fragment?: string;
  buffers?: readonly GPUVertexBufferLayout[];
  /** The layouts of groups 1 and up; group 0 is the kit's. */
  groups?: readonly GPUBindGroupLayout[];
  cullMode?: GPUCullMode;
};

/** What every layer is made from. */
export type OutdoorKit = {
  device: GPUDevice;
  /** Group 0 of every scene-pass pipeline: the `OutdoorFrame` block alone. */
  layout: GPUBindGroupLayout;
  /** The `OutdoorFrame` block's buffer, for a group of a layer's own pass. */
  frame: GPUBuffer;
  /**
   * `roots` and what they need, assembled and compiled; rejects with the
   * compiler's words where it does not compile.
   */
  shader: (label: string, roots: readonly Wgsl[]) => Promise<GPUShaderModule>;
  /** A pipeline drawing into the scene pass's targets and depth. */
  pipeline: (made: ScenePipeline) => Promise<GPURenderPipeline>;
};

/** Makes one layer; the renderer calls each once, before the first frame. */
export type LayerMaker = (kit: OutdoorKit) => Promise<OutdoorLayer>;

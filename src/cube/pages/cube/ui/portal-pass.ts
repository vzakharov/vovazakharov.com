/// <reference types="@webgpu/types" />

import type { CanDispose, Sized } from '@/kernel/shared/typings';

import type { Seen } from '@/cube/shared/lib/vec';
import { assemble } from '@/cube/shared/shader';

import type { Scenery } from '../lib/mesh';
import { DOORWAY_VERTICES } from '../lib/portal-frame';
import { createUniforms } from '../lib/uniforms';
import { type Drawn, drawnOf, drawRuns } from './drawn';
import { PORTAL_PASS } from './portal-pass.shader.generated';
import { DEPTH_FORMAT, type Programs, SCENE_TARGETS } from './programs';
import { createReflection } from './reflection';
import { beginScene, type Cleared, createDepthTarget } from './scene-pass';
import { UNREPEATED } from './slowdown';

/** Floats of a vertex of the doorway's opening: its place. */
const CORNER_FLOATS = 3;

/**
 * What an open portal door shows a frame: the view of the rooms beyond in
 * their own frame, the doorway's opening as `doorwayOpening` gives it, and
 * the door itself in the eye's frame, which stands among them where it has
 * swung past its wall.
 */
export type Through = {
  seen: Seen;
  opening: Float32Array<ArrayBuffer>;
  door: Scenery;
};

/** One encoding of the rooms beyond: what `Through` leaves to the frame. */
type BeyondShot = Cleared & {
  /** The frame's `Uniforms`, seen as `Through.seen`. */
  uniforms: Float32Array<ArrayBuffer>;
  size: Sized;
  /** The group of the frame's own uniforms, which the door is drawn by. */
  group: GPUBindGroup;
};

/**
 * The rooms through a portal door, drawn as a scene of their own and laid in
 * the doorway of the scene the eye stands in.
 */
export type PortalPass = CanDispose & {
  /**
   * Replaces the rooms beyond, none for null; their floors must be prepared
   * in the air of floor `air`.
   */
  upload: (rooms: Scenery | null, air: number) => void;
  /**
   * Records the scene beyond and the passes that fill its mirrors; resolves
   * to what `lay` lays, null where no rooms are uploaded.
   */
  shoot: (
    encoder: GPUCommandEncoder,
    through: Through,
    shot: BeyondShot,
  ) => GPUTextureView | null;
  /**
   * Draws `beyond` into `pass`, a scene pass of the same size seen through
   * `viewProjection`, in the doorway `opening`.
   */
  lay: (
    pass: GPURenderPassEncoder,
    beyond: GPUTextureView,
    viewProjection: Float32Array,
    opening: Float32Array<ArrayBuffer>,
  ) => void;
};

export function createPortalPass(
  device: GPUDevice,
  uniformLayout: GPUBindGroupLayout,
  programOf: Programs['of'],
): PortalPass {
  const reflection = createReflection(device);
  const depth = createDepthTarget(device);
  const uniforms = createUniforms(device, uniformLayout);
  const shader = device.createShaderModule({ code: assemble([PORTAL_PASS]) });
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: shader,
      entryPoint: 'doorwayVertex',
      buffers: [
        {
          arrayStride: CORNER_FLOATS * 4,
          attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }],
        },
      ],
    },
    fragment: {
      module: shader,
      entryPoint: 'doorwayMain',
      targets: SCENE_TARGETS,
    },
    primitive: { topology: 'triangle-list', cullMode: 'none' },
    depthStencil: {
      format: DEPTH_FORMAT,
      depthWriteEnabled: true,
      depthCompare: 'greater',
    },
  });
  const doorway = device.createBuffer({
    size: 16 * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const corners = device.createBuffer({
    size: DOORWAY_VERTICES * CORNER_FLOATS * 4,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  let rooms: Drawn | null = null;
  let door: Drawn | null = null;

  return {
    upload: (scenery, air) => {
      const next =
        scenery === null
          ? null
          : drawnOf(device, scenery, (n) => programOf(n, air).faces);
      rooms?.buffer.destroy();
      rooms = next;
    },
    shoot: (encoder, through, { uniforms: data, group, ...shot }) => {
      if (rooms === null) return null;
      device.queue.writeBuffer(uniforms.buffer, 0, data);
      const stood = drawnOf(device, through.door, (n) => programOf(n).faces);
      door?.buffer.destroy();
      door = stood;
      const pass = beginScene(
        encoder,
        { ...shot, reflection, depth },
        UNREPEATED,
      );
      pass.setBindGroup(0, uniforms.group);
      drawRuns(pass, rooms);
      if (door !== null) {
        pass.setBindGroup(0, group);
        drawRuns(pass, door);
      }
      pass.end();
      return reflection.run(encoder, through.seen);
    },
    lay: (pass, beyond, viewProjection, opening) => {
      device.queue.writeBuffer(doorway, 0, Float32Array.from(viewProjection));
      device.queue.writeBuffer(corners, 0, opening);
      pass.setPipeline(pipeline);
      pass.setBindGroup(
        0,
        device.createBindGroup({
          layout: pipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: { buffer: doorway } },
            { binding: 1, resource: beyond },
          ],
        }),
      );
      pass.setVertexBuffer(0, corners);
      pass.draw(DOORWAY_VERTICES);
    },
    dispose: () => {
      rooms?.buffer.destroy();
      door?.buffer.destroy();
      reflection.dispose();
      depth.dispose();
      uniforms.buffer.destroy();
      doorway.destroy();
      corners.destroy();
    },
  };
}

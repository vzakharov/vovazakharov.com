/// <reference types="@webgpu/types" />

import type { CanDispose, Sized } from '@/kernel/shared/typings';

import { ROOM_METRES } from '@/cube/shared/lib/room-shape';
import type { Seen } from '@/cube/shared/lib/vec';
import { assemble } from '@/cube/shared/shader';

import { inverse } from '../lib/matrix';
import { SCENE_FORMAT } from './bloom';
import { COVER } from './cover.shader.generated';
import { jitterOf, lowSizeOf, type Share, shifted } from './drowsy-phases';
import { DROWSY_RESOLVE } from './drowsy-resolve.shader.generated';
import { drowsiness, installConsole } from './drowsy-settings';
import { beginRepeat, type Repeat, repeatsOf } from './slowdown';

/** What each pixel's trust in its history is kept as. */
const TRUST_FORMAT: GPUTextureFormat = 'r16float';

/** Floats of `drowsy-resolve.wgsl`'s `Resolve`: two matrices, three vectors. */
const RESOLVE_FLOATS = 16 + 16 + 4 + 4 + 4;

/** A frame's low pass: its size, and the view it draws through. */
export type LowPass = Sized & {
  /** A view-projection of the full frame as the low pass draws through it. */
  shift: (viewProjection: Float32Array) => Float32Array;
};

/**
 * The drowsy eye, set from the browser's console as `cube` for as long as
 * it lives: off, every frame is drawn whole and no history is held.
 */
export type DrowsyEye = CanDispose & {
  /** How each stage of the next frame is encoded under the slowdown. */
  repeats: () => readonly Repeat[];
  /** How far the lens darkens the frame's corners. */
  vignette: () => number;
  /**
   * Starts a `full` frame: its low pass, or null where the eye is awake and
   * the frame is drawn whole.
   */
  lowPass: (full: Sized) => LowPass | null;
  /**
   * Records the resolve of `lit`, the frame's low pass, into the history,
   * the frame seen whole as `seen`, and gives back the full frame it makes.
   * `stamp` is written by its last encoding.
   */
  resolve: (
    encoder: GPUCommandEncoder,
    lit: GPUTextureView,
    seen: Seen,
    stamp?: GPURenderPassTimestampWrites,
  ) => GPUTextureView;
};

/** Two frames of light and trust, one read while the other is written. */
type History = Sized & {
  share: Share;
  textures: GPUTexture[];
  light: readonly [GPUTextureView, GPUTextureView];
  trust: readonly [GPUTextureView, GPUTextureView];
};

/** `view` as a target the pass clears and keeps. */
const cleared = (view: GPUTextureView): GPURenderPassColorAttachment => ({
  view,
  loadOp: 'clear',
  storeOp: 'store',
});

export function createDrowsyEye(device: GPUDevice): DrowsyEye {
  const { settings, console: knobs } = drowsiness();
  const installed = installConsole(knobs);
  const shader = device.createShaderModule({
    code: assemble([DROWSY_RESOLVE, COVER]),
  });
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module: shader, entryPoint: 'vertexMain' },
    fragment: {
      module: shader,
      entryPoint: 'resolveMain',
      targets: [{ format: SCENE_FORMAT }, { format: TRUST_FORMAT }],
    },
  });
  const linear = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
  });
  const uniforms = device.createBuffer({
    size: RESOLVE_FLOATS * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  let history: History | null = null;
  /** Which of the history's two frames holds the last one. */
  let last: 0 | 1 = 0;
  /** The view-projection the last frame was resolved through; null for none. */
  let previous: Float32Array | null = null;
  let frame = 0;
  /** The pixel of each block the frame under way draws fresh. */
  let jitter = { x: 0, y: 0 };
  /** The bind groups reading `lit` and each of the history's frames. */
  let reading: {
    lit: GPUTextureView;
    of: History;
    groups: readonly [GPUBindGroup, GPUBindGroup];
  } | null = null;

  const drop = (): void => {
    for (const texture of history?.textures ?? []) texture.destroy();
    history = null;
    previous = null;
    reading = null;
  };

  const historyOf = ({ width, height }: Sized, share: Share): History => {
    if (
      history?.width === width &&
      history.height === height &&
      history.share === share
    ) {
      return history;
    }
    drop();
    const target = (format: GPUTextureFormat): GPUTexture =>
      device.createTexture({
        size: [width, height],
        format,
        usage:
          GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      });
    const textures = [
      target(SCENE_FORMAT),
      target(SCENE_FORMAT),
      target(TRUST_FORMAT),
      target(TRUST_FORMAT),
    ];
    const [light0, light1, trust0, trust1] = textures.map((texture) =>
      texture.createView(),
    );
    if (!light0 || !light1 || !trust0 || !trust1) {
      throw new Error('The history has fewer frames than it was made with');
    }
    history = {
      width,
      height,
      share,
      textures,
      light: [light0, light1],
      trust: [trust0, trust1],
    };
    return history;
  };

  const groupsOf = (
    lit: GPUTextureView,
    of: History,
  ): readonly [GPUBindGroup, GPUBindGroup] => {
    if (reading?.lit === lit && reading.of === of) return reading.groups;
    const group = (index: 0 | 1): GPUBindGroup =>
      device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: uniforms } },
          { binding: 1, resource: lit },
          { binding: 2, resource: of.light[index] },
          { binding: 3, resource: of.trust[index] },
          { binding: 4, resource: linear },
        ],
      });
    reading = { lit, of, groups: [group(0), group(1)] };
    return reading.groups;
  };

  return {
    repeats: () => repeatsOf(settings().slowdown),
    vignette: () => {
      const { drowsy, vignette } = settings();
      return drowsy ? vignette : 0;
    },
    lowPass: (full) => {
      const { drowsy, share } = settings();
      if (!drowsy) {
        drop();
        return null;
      }
      historyOf(full, share);
      jitter = jitterOf(share, frame);
      frame += 1;
      const low = lowSizeOf(full, share);
      const at = jitter;
      return {
        ...low,
        shift: (viewProjection) =>
          shifted(viewProjection, at, full, low, share),
      };
    },
    resolve: (encoder, lit, { viewProjection, eye }, stamp) => {
      if (history === null) {
        throw new Error('The drowsy eye resolves a frame it did not start');
      }
      const { width, height, share, light, trust } = history;
      const data = new Float32Array(RESOLVE_FLOATS);
      data.set(inverse(viewProjection), 0);
      data.set(previous ?? viewProjection, 16);
      data.set([...eye, ROOM_METRES], 32);
      data.set([width, height, share, settings().drowsiness], 36);
      data.set([jitter.x, jitter.y, previous === null ? 0 : 1], 40);
      device.queue.writeBuffer(uniforms, 0, data);
      const next = last === 0 ? 1 : 0;
      const group = groupsOf(lit, history)[last];
      for (const repeat of repeatsOf(settings().slowdown)) {
        const pass = beginRepeat(
          encoder,
          {
            colorAttachments: [cleared(light[next]), cleared(trust[next])],
            ...(stamp === undefined ? {} : { timestampWrites: stamp }),
          },
          repeat,
          { width, height },
        );
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, group);
        pass.draw(3);
        pass.end();
      }
      previous = Float32Array.from(viewProjection);
      last = next;
      return light[next];
    },
    dispose: () => {
      installed.dispose();
      drop();
      uniforms.destroy();
    },
  };
}

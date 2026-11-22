import {
  clamp,
  dot,
  exp,
  float,
  Fn,
  If,
  log,
  max,
  min,
  mix,
  normalize,
  screenCoordinate,
  screenUV,
  select,
  sqrt,
  texture,
  uniform,
  vec2,
  vec4,
} from 'three/tsl';
import {
  HalfFloatType,
  LinearFilter,
  Matrix4,
  NearestFilter,
  type Node,
  NodeMaterial,
  type PerspectiveCamera,
  QuadMesh,
  RenderTarget,
  Vector2,
  Vector3,
  type WebGPURenderer,
} from 'three/webgpu';

import type { CanDispose } from '@/kernel/shared/typings';

import { R, type Vec3 } from '@/island/shared/globe';

import { HIGHEST_TOP, LOWEST_BASE } from '../lib/clouds';
import type { CloudFrame, CloudNodes } from './cloud-nodes';
import type { F } from './cloud-noise';
import { cloudRays } from './cloud-rays';

type V = Node<'vec3'>;
type V2 = Node<'vec2'>;
type V4 = Node<'vec4'>;

/** The passes that fill the swift clouds' buffer, run before each frame. */
type CloudPass = CanDispose & {
  /**
   * Marches this frame's share of the clouds and carries the rest over from
   * the last frame, for `camera` as it is about to draw, the eye at `eye`
   * (planet-centred metres). Called before every frame that reads `along`.
   */
  readonly prepare: (
    renderer: WebGPURenderer,
    camera: PerspectiveCamera,
    eye: Vec3,
  ) => void;
  /** Drops what the buffer holds: the next `prepare` marches all of it. */
  readonly forget: () => void;
};

/** Holds the swift look's clouds, which must be prepared before each frame it draws. */
export type Clouded = { readonly clouds: CloudPass };

export type SwiftClouds = CloudPass & {
  /** `CloudNodes['along']`, read from the buffer `prepare` fills: a fragment's own ray, cut at `metres`. */
  readonly along: CloudNodes['along'];
};

/** The buffer's pixels per screen pixel, each way. */
const BUFFER_SCALE = 0.5;
/** Buffer pixels a side of the block one of which is marched each frame. */
const BLOCK = 2;
/** The order a block's pixels are marched in, one per frame: a Bayer walk. */
const WALK = [
  [0, 0],
  [1, 1],
  [1, 0],
  [0, 1],
] as const;
/** How far past its fresh neighbours a carried pixel may stray, as a share of their range. */
const CLAMP_SLACK = 0.1;
/** The eye moving farther than this in one frame, plus its height, is a jump: nothing carries over. */
const JUMP_METRES = 2000;

/**
 * The clouds for the swift look: marched at a quarter of the screen's pixels,
 * one pixel of each 2×2 block a frame, so a frame marches a sixteenth of what
 * the fine look does. Each pixel not marched this frame is carried over from
 * the last, moved by the eye's turn and travel to where its cloud now shows,
 * and clamped to what its freshly marched neighbours span, so a cloud never
 * smears behind a turn; where the last frame did not see it, the neighbours
 * stand in. The buffer holds each ray's whole stretch of the layer, the
 * ground ignored, so it is smooth across every silhouette, and a fragment
 * cuts it at its own distance: a surface inside the layer keeps the share of
 * the cloud before it.
 */
export function swiftClouds(
  clouds: CloudNodes,
  frame: CloudFrame,
): SwiftClouds {
  const rays = cloudRays(frame);
  /**
   * How far a ray runs before the sea's sphere stops it, or past every cloud
   * when it misses: the march reads a ray's weather where the ray falls
   * through the cumulus, which for a ray that meets the sea is on this side of
   * it, as the fine look reads it, and not on the planet's far side.
   */
  const reach = (direction: V): F => {
    const half = frame.radius.mul(dot(direction, frame.up));
    const inside = half.mul(half).sub(frame.shell);
    return select(
      half.lessThan(0).and(inside.greaterThan(0)),
      half.negate().sub(sqrt(max(inside, 0))),
      float(1e12),
    );
  };
  /** The whole stretch of a ray from the eye through every layer the clouds may fill, up to the sea. */
  const span = (direction: V) =>
    rays.stretch(
      dot(direction, frame.up),
      reach(direction),
      LOWEST_BASE,
      HIGHEST_TOP,
    );
  const size = uniform(new Vector2(1, 1));
  const sparseSize = uniform(new Vector2(1, 1));
  const offset = uniform(new Vector2());
  /** Screen uv to a world direction, the eye at the origin. */
  const unproject = uniform(new Matrix4());
  /** A world point, the last frame's eye at the origin, to the last frame's clip space. */
  const lastProject = uniform(new Matrix4());
  /** The eye's travel since the last frame. */
  const moved = uniform(new Vector3());
  /** 1 while the last frame's buffer may be carried over. */
  const trusted = uniform(0);
  /** Which of `kept` this frame's buffer is in. */
  const current = uniform(0);

  const target = (filter: typeof LinearFilter | typeof NearestFilter) => {
    const made = new RenderTarget(1, 1, {
      type: HalfFloatType,
      depthBuffer: false,
      minFilter: filter,
      magFilter: filter,
      generateMipmaps: false,
    });
    return made;
  };
  const sparse = target(NearestFilter);
  const kept = [target(LinearFilter), target(LinearFilter)] as const;

  const directionAt = (uv: V2): V => {
    const ndc = vec4(uv.x.mul(2).sub(1), uv.y.mul(-2).add(1), 0.5, 1);
    const far = unproject.mul(ndc);
    return normalize(far.xyz.div(far.w));
  };

  // The march: each sparse pixel marches its block's pixel for this frame.
  const marched = new NodeMaterial();
  marched.fragmentNode = Fn(() => {
    const pixel = screenCoordinate.xy.floor().mul(BLOCK).add(offset).add(0.5);
    const direction = directionAt(pixel.div(size));
    return clouds.along(direction, reach(direction)).seen;
  })();
  const march = new QuadMesh(marched);

  const sparseAt = (cell: V2): V4 =>
    texture(sparse.texture, cell.add(0.5).div(sparseSize));

  /** The buffer's pixel at `screenUV`, from the fresh march and from `last`. */
  const carried = (last: RenderTarget): V4 =>
    Fn(() => {
      const pixel = screenCoordinate.xy.floor();
      const cell = pixel.div(BLOCK).floor();
      const mine = pixel.sub(cell.mul(BLOCK));
      const fresh = sparseAt(cell);
      const result = vec4(fresh).toVar();
      If(mine.equal(offset).all().not(), () => {
        // The fresh neighbours' spread, which a carried pixel stays within.
        const low = vec4(fresh).toVar();
        const high = vec4(fresh).toVar();
        for (const x of [-1, 0, 1])
          for (const y of [-1, 0, 1]) {
            if (x === 0 && y === 0) continue;
            const near = sparseAt(cell.add(vec2(x, y)));
            low.assign(min(low, near));
            high.assign(max(high, near));
          }
        // Between the fresh pixels, for want of what the last frame saw.
        const at = pixel.sub(offset).div(BLOCK);
        const corner = at.floor();
        const t = at.sub(corner);
        const row = (y: number) =>
          mix(
            sparseAt(corner.add(vec2(0, y))),
            sparseAt(corner.add(vec2(1, y))),
            t.x,
          );
        result.assign(mix(row(0), row(1), t.y));
        If(trusted.greaterThan(0), () => {
          const direction = directionAt(screenUV);
          const { from, length } = span(direction);
          // Where this pixel's cloud sat for the last frame's eye.
          const point = direction.mul(from.add(length.mul(0.5))).add(moved);
          const clip = lastProject.mul(vec4(point, 1));
          const uv = clip.xy.div(clip.w).mul(vec2(0.5, -0.5)).add(0.5).toVar();
          const seen = clip.w
            .greaterThan(0)
            .and(uv.x.greaterThan(0))
            .and(uv.x.lessThan(1))
            .and(uv.y.greaterThan(0))
            .and(uv.y.lessThan(1));
          If(seen, () => {
            const slack = high.sub(low).mul(CLAMP_SLACK);
            result.assign(
              clamp(texture(last.texture, uv), low.sub(slack), high.add(slack)),
            );
          });
        });
      });
      return result;
    })();
  const resolving = kept.map((last) => {
    const material = new NodeMaterial();
    material.fragmentNode = carried(last);
    return material;
  });
  const resolves = resolving.map((material) => new QuadMesh(material));

  const along: CloudNodes['along'] = (direction, metres) => {
    const { from, length } = span(direction);
    const whole = texture(kept[0].texture, screenUV);
    const read = Fn(() => {
      const buffered = vec4(whole).toVar();
      // `kept[1]` holds this frame's buffer every other frame.
      If(current.equal(1), () => {
        buffered.assign(texture(kept[1].texture, screenUV));
      });
      // The cloud as if spread evenly along the ray: exact at either end.
      const share = clamp(metres.sub(from).div(max(length, 1e-3)), 0, 1);
      const through = max(buffered.a, 1e-4);
      const cut = exp(log(through).mul(share));
      const light = buffered.rgb
        .mul(cut.oneMinus())
        .div(max(through.oneMinus(), 1e-4));
      return vec4(
        select(through.greaterThan(0.9999), buffered.rgb.mul(share), light),
        cut,
      );
    })();
    return { seen: read, near: from };
  };

  /** This frame's world-to-clip, which the next frame carries from. */
  const viewProject = new Matrix4();
  let frameIndex = 0;
  let lastEye: Vec3 | null = null;
  const drawing = new Vector2();

  const resize = (renderer: WebGPURenderer) => {
    renderer.getDrawingBufferSize(drawing);
    const width = Math.max(1, Math.ceil(drawing.x * BUFFER_SCALE));
    const height = Math.max(1, Math.ceil(drawing.y * BUFFER_SCALE));
    if (width === size.value.x && height === size.value.y) return false;
    size.value.set(width, height);
    sparseSize.value.set(Math.ceil(width / BLOCK), Math.ceil(height / BLOCK));
    sparse.setSize(sparseSize.value.x, sparseSize.value.y);
    for (const one of kept) one.setSize(width, height);
    return true;
  };

  const resolve = (renderer: WebGPURenderer, step: (typeof WALK)[number]) => {
    offset.value.set(step[0], step[1]);
    renderer.setRenderTarget(sparse);
    march.render(renderer);
    const from = current.value;
    renderer.setRenderTarget(from === 0 ? kept[1] : kept[0]);
    resolves[from]?.render(renderer);
    current.value = 1 - from;
  };

  return {
    along,
    prepare: (renderer, camera, eye) => {
      const resized = resize(renderer);
      camera.updateMatrixWorld();
      const jumped =
        lastEye !== null &&
        Math.hypot(
          eye[0] - lastEye[0],
          eye[1] - lastEye[1],
          eye[2] - lastEye[2],
        ) >
          JUMP_METRES + Math.hypot(...eye) - R;
      if (lastEye === null || resized || jumped) trusted.value = 0;
      unproject.value.multiplyMatrices(
        camera.matrixWorld,
        camera.projectionMatrixInverse,
      );
      viewProject.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse,
      );
      moved.value.set(
        lastEye === null ? 0 : eye[0] - lastEye[0],
        lastEye === null ? 0 : eye[1] - lastEye[1],
        lastEye === null ? 0 : eye[2] - lastEye[2],
      );
      const before = renderer.getRenderTarget();
      if (trusted.value === 0) {
        // Nothing to carry: march the whole block, a step at a time.
        for (const step of WALK) {
          resolve(renderer, step);
          trusted.value = 1;
          moved.value.set(0, 0, 0);
          lastProject.value.copy(viewProject);
        }
      } else {
        resolve(renderer, WALK[frameIndex % WALK.length] ?? WALK[0]);
      }
      renderer.setRenderTarget(before);
      frameIndex += 1;
      lastEye = eye;
      lastProject.value.copy(viewProject);
    },
    forget: () => {
      trusted.value = 0;
    },
    dispose: () => {
      sparse.dispose();
      for (const one of kept) one.dispose();
      marched.dispose();
      for (const material of resolving) material.dispose();
    },
  };
}

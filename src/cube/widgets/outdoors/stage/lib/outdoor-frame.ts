import type { SeenOnScreen } from '@/cube/shared/lib/clock';
import type { Vec3 } from '@/cube/shared/lib/vec';
import { wgsl } from '@/cube/shared/shader';
import type { Laddered } from '@/cube/entities/island';

/**
 * The uniform block every outdoor pipeline reads as group 0, binding 0, field
 * by field in buffer order: the TS packing and the WGSL struct are both
 * derived from this list. Every field is whole `vec4f`s.
 */
const FIELDS = [
  {
    name: 'viewProjection',
    type: 'mat4x4f',
    floats: 16,
    doc: 'World to clip.',
  },
  { name: 'inverse', type: 'mat4x4f', floats: 16, doc: 'Clip to world.' },
  {
    name: 'eye',
    type: 'vec4f',
    floats: 4,
    doc: 'The eye in the world; w is 1.',
  },
  { name: 'sun', type: 'vec4f', floats: 4, doc: 'Towards the sun; w is 0.' },
  {
    name: 'clock',
    type: 'vec4f',
    floats: 4,
    doc: "Seconds into the hour, which hour, the screen's width and height.",
  },
  {
    name: 'state',
    type: 'vec4f',
    floats: 4,
    doc: 'x is 1 while the ladder stands at the doorway, 0 once it is gone.',
  },
] as const;

type FieldName = (typeof FIELDS)[number]['name'];

/** The floats of the block. */
export const OUTDOOR_FRAME_FLOATS = FIELDS.reduce(
  (sum, { floats }) => sum + floats,
  0,
);

/**
 * What one frame of the outside is seen from and when: the eye in the world
 * frame, the matrices column-major, the screen in pixels.
 */
export type OutdoorFrame = SeenOnScreen &
  Laddered & {
    /** Clip space back to the world, column-major. */
    inverse: Float32Array;
    sun: Vec3;
  };

/** `frame` as the uniform buffer holds it. */
export function packOutdoorFrame({
  viewProjection,
  inverse,
  eye,
  sun,
  ladderGone,
  seconds,
  hour,
  width,
  height,
}: OutdoorFrame): Float32Array<ArrayBuffer> {
  const values: Record<FieldName, ArrayLike<number>> = {
    viewProjection,
    inverse,
    eye: [...eye, 1],
    sun: [...sun, 0],
    clock: [seconds, hour, width, height],
    state: [ladderGone === true ? 0 : 1, 0, 0, 0],
  };
  const data = new Float32Array(OUTDOOR_FRAME_FLOATS);
  let offset = 0;
  for (const { name, floats } of FIELDS) {
    data.set(values[name], offset);
    offset += floats;
  }
  return data;
}

/**
 * `struct OutdoorFrame` and `frame`, the block bound at group 0, binding 0.
 */
export const OUTDOOR_FRAME = wgsl(
  'outside/frame',
  /* wgsl */ `
struct OutdoorFrame {
${FIELDS.map(({ name, type, doc }) => `  /// ${doc}\n  ${name}: ${type},`).join('\n')}
};

@group(0) @binding(0) var<uniform> frame: OutdoorFrame;
`,
);

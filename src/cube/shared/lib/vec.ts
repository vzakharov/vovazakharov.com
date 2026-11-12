/** A point or direction in space: x east, y up, z south. */
export type Vec3 = readonly [number, number, number];

/** Something seen from a point: `eye`, in the frame the thing names. */
export type WithEye = { eye: Vec3 };

/** Where a scene is seen from, in the frame its `eye` is in. */
export type Seen = WithEye & {
  /** That frame to clip space, column-major. */
  viewProjection: Float32Array;
};

/** A point on the ground plan: x east, z south. */
export type Vec2 = readonly [number, number];

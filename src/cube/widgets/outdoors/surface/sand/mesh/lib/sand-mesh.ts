/**
 * The sand's mesh is rings round the point under the eye, each a little wider
 * than the last, so a triangle covers about the same share of the screen at
 * any distance: millimetres at a cheek on the sand, metres at the far shore.
 * A vertex is only its index — ring and spoke — and the shader places it.
 */
export const SAND_MESH = {
  /** Spokes round the eye. */
  spokes: 384,
  rings: 500,
  /** A ring's radius is `inner · (growth^ring − 1)` metres. */
  inner: 0.4,
  growth: 1.014,
} as const;

/** The radius of `ring`, metres from the point under the eye. */
export const ringRadius = (ring: number): number =>
  SAND_MESH.inner * (SAND_MESH.growth ** ring - 1);

/**
 * The mesh's triangles as indices, vertex `ring · spokes + spoke`: two per
 * cell between neighbouring rings and spokes, the last spoke joined to the
 * first.
 */
export function sandIndices(): Uint32Array<ArrayBuffer> {
  const { spokes, rings } = SAND_MESH;
  const indices = new Uint32Array((rings - 1) * spokes * 6);
  let at = 0;
  for (let ring = 0; ring < rings - 1; ring += 1) {
    for (let spoke = 0; spoke < spokes; spoke += 1) {
      const near = ring * spokes + spoke;
      const nearNext = ring * spokes + ((spoke + 1) % spokes);
      const far = near + spokes;
      const farNext = nearNext + spokes;
      indices.set([near, far, farNext, near, farNext, nearNext], at);
      at += 6;
    }
  }
  return indices;
}

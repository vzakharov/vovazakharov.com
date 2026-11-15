/**
 * What a face is made of. The world names one per face it builds and a floor's
 * theme draws each its own way, so the order is the kind number both the
 * vertex buffer and the shader count by. `owned` is the floor of a room the
 * viewer bought; `trim` is what stands proud of a wall — pillars, posts.
 * From `metal` on are the stuffs things in a room are made of, drawn alike
 * on every floor and tinted by the face's paint.
 */
export const SURFACES = [
  'wall',
  'floor',
  'owned',
  'ceiling',
  'trim',
  'plate',
  'handle',
  'metal',
  'wood',
  'plastic',
  'fabric',
  'glass',
  'screen',
  'paper',
  'foliage',
  'rubber',
  'skin',
] as const;

export type Surface = (typeof SURFACES)[number];

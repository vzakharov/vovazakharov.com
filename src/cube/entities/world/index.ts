<<<<<<< HEAD
export {
  descend,
  DROP,
  eyeInFrame,
  faces,
  HOLE_SIDE,
  placed,
  ROOM_HEIGHT,
} from './model/geometry';
=======
export { type Address, decodeAddress, encodeAddress } from './model/address';
export { descend, DROP, eyeInFrame, faces, HOLE_SIDE } from './model/geometry';
>>>>>>> origin/claude/hash-maze-cube-m6wq80
export {
  floorsOf,
  holeMiddle,
  type HoleOf,
  holeQuarter,
  holesOf,
  type Quarter,
} from './model/hole';
export { type Lever, leverOf, type Pulled } from './model/lever';
export { maze } from './model/maze';
export { plant } from './model/plant';
export { planted } from './model/planted';
<<<<<<< HEAD
export type { InRoom, Pose, Posed, WallMounted } from './model/pose';
export type { Facet, Quad, Surface, Vec3 } from './model/quad';
export { type Room, roomKey } from './model/room';
=======
export type { InRoom, Pose, Posed, Standing } from './model/pose';
export type { Quad, Surface, Vec3 } from './model/quad';
export { roomKey } from './model/room';
>>>>>>> origin/claude/hash-maze-cube-m6wq80
export { sight, slabRooms, withBelow } from './model/rooms';
export {
  type Holdings,
  priceOf,
  type Sign,
  type Signed,
  signFacet,
  type SignKind,
  signsSeen,
} from './model/sale';
export { mazeWalls, type Walls } from './model/walls';

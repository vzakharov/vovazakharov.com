export {
  type Address,
  decodeAddress,
  encodeAddress,
  type Hatched,
} from './model/address';
export {
  type Ajar,
  doorFrame,
  doorLeaf,
  DOORWAY_DEEP,
  type Facing,
  leafLine,
} from './model/door';
export {
  type Doors,
  doorSides,
  EXIT,
  mazeDoored,
  wallsAround,
  withOpen,
} from './model/doorway';
export { eastKind } from './model/doorways';
export { descend, DROP, eyeInFrame, type Placed, placed } from './model/frame';
export { faces, HOLE_SIDE } from './model/geometry';
export { firstPortal, hintFacets, hintsSeen } from './model/hint';
export {
  floorsOf,
  holeMiddle,
  type HoleOf,
  holeQuarter,
  holesOf,
  type Quarter,
} from './model/hole';
export { landingsSeen } from './model/landing';
export { loft, type Ring } from './model/loft';
export { DEEPEST_FLOOR, maze, type RolledMaze } from './model/maze';
export {
  boardFacets,
  type BoardShape,
  type Hung,
  type SignMount,
} from './model/mount';
export { PILL_RADIUS, pillQuads } from './model/pill';
export { plant } from './model/plant';
export { planted } from './model/planted';
export {
  type Beyond,
  beyondOf,
  carried,
  farSideOf,
  isBeyond,
  pastDoorway,
  roomBeyond,
  wayThrough,
} from './model/portal';
export { portalsOf } from './model/portals';
export type {
  Gazing,
  InRoom,
  Pose,
  Posed,
  Standing,
  WallMounted,
} from './model/pose';
export {
  box,
  face,
  type Facet,
  minus,
  plus,
  type Quad,
  UP,
} from './model/quad';
export {
  type Floored,
  type InRoomOf,
  isRoom,
  type Room,
  roomKey,
} from './model/room';
export {
  opens,
  parent,
  type Sight,
  sight,
  slabRooms,
  type Step,
  stepped,
  STEPS,
  type View,
  withBelow,
} from './model/rooms';
export {
  type Holdings,
  priceOf,
  type Sign,
  type Signed,
  signFacets,
  type SignKind,
  signPost,
  signsSeen,
} from './model/sale';
export { closedSides, inPlace, type Setting, settingOf } from './model/setting';
export { pillOn, type Shelf, shelfOf } from './model/shelf';
export { type RolledTraits, traits } from './model/traits';
export { type DoorWall, isSameWall } from './model/wall-frame';
export { mazeWalls, type Walls } from './model/walls';
export { isOutside, type Outside, type Whereabouts } from './model/whereabouts';
export { WALL_HALF } from '@/cube/shared/lib/room-shape';
export type { Vec3 } from '@/cube/shared/lib/vec';
export {
  cross3 as cross,
  dot3 as dot,
  scaled as times,
  unit3 as unit,
} from '@/cube/shared/lib/vec';

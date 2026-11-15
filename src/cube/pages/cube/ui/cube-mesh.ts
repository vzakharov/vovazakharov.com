import { themeOf } from '@/cube/entities/theme';
import {
  type Ajar,
  boardFacets,
  doorLeaf,
  DOORWAY_DEEP,
  faces,
  type Facet,
  type Facing,
  type Holdings,
  type HoleOf,
  holesOf,
  inPlace,
  type InRoomOf,
  isBeyond,
  isSameWall,
  type Landing,
  landingsSeen,
  maze,
  mazeDoored,
  parent,
  pastDoorway,
  placed,
  planted,
  type Pose,
  priceOf,
  type Quad,
  type Room,
  roomKey,
  type Setting,
  settingOf,
  type Sight,
  sight,
  type Sign,
  type Signed,
  signFacets,
  signPost,
  signsSeen,
  slabRooms,
  traits,
  withBelow,
  withOpen,
} from '@/cube/entities/world';
import { furnish } from '@/cube/features/decor';

import type COPY from '../config/messages/en.json';
import { FAR } from '../lib/camera';
import { formatPrice } from '../lib/figures';
import { pack, type RoomLook, type Scenery } from '../lib/mesh';
import { roomLooks } from '../lib/room-look';
import type { Boards } from './board-textures';
import { drawPoster, POSTER } from './poster-board';
import { drawBoard } from './sign-board';

type LookOf = (room: Room) => RoomLook;

/**
 * The sign of a room on the eye's floor, null where the room has none or the
 * scene has not resolved it yet.
 */
export type SignOf = (room: Room) => Sign | null;

/**
 * One room's view: its faces, the pill taken left off its shelf, its boards,
 * `stood`, a frame's moving quads where the view has their rooms, `leaf`, the
 * leaf of the door it was built open as a frame's `door` swings it, and the
 * settings of the rooms whose happenings it shows.
 */
export type Mesh = {
  faces: (taken: InRoomOf | null) => Scenery;
  stood: (moving: readonly Quad[]) => Scenery;
  leaf: (door: Ajar | null) => Quad[];
  boards: readonly Boards[];
  signOf: SignOf;
  settings: readonly Setting[];
};

/** The offer's copy, which holds what each kind of sign says. */
type SignCopy = (typeof COPY)['offer'];

/** What the signs say, and which rooms they mark as the viewer's. */
export type Selling = {
  copy: SignCopy;
  /** The rooms the viewer bought, read on every mesh build. */
  bought: () => Holdings;
};

const rolled = maze(planted.seed);
const walls = mazeDoored(rolled);
export const rolledTraits = traits(planted.seed);

const pillarOf = (n: number): number => themeOf(n).pillar;

/** The boards of `facets`' rooms, as paper. */
const asPaper = (facets: readonly Facet[], lookOf: LookOf) =>
  pack(
    facets.map((facet) => ({ ...facet, surface: 'paper' as const })),
    lookOf,
  );

/**
 * The boards of `signed` in the eye's frame at `pose`, one texture per floor
 * and kind of sign, since a floor's rooms share a price.
 */
function signBoards(
  pose: Pose,
  signed: readonly Signed[],
  { signs, sold }: SignCopy,
  lookOf: LookOf,
): Boards[] {
  const byBoard = Map.groupBy(
    signed,
    ({ room, sign }) => `${sign.kind}/${String(room.n)}`,
  );
  return [...byBoard].flatMap(([id, rooms]) => {
    const [first] = rooms;
    if (first === undefined) return [];
    const { n } = first.room;
    const { kind } = first.sign;
    const isSold = kind === 'yours';
    const line = isSold ? sold : formatPrice(priceOf(n));
    return [
      {
        id,
        image: () => drawBoard(n, isSold, signs[kind], line),
        scenery: asPaper(
          rooms.flatMap(({ room, sign }) =>
            signFacets(sign, room, placed(pose, room)),
          ),
          lookOf,
        ),
      },
    ];
  });
}

/** The posters of `landings` in the eye's frame at `pose`, one per floor. */
const posterBoards = (
  pose: Pose,
  landings: readonly Landing[],
  lookOf: LookOf,
): Boards[] =>
  [...Map.groupBy(landings, ({ room }) => room.n)].map(([n, rooms]) => ({
    id: `poster/${String(n)}`,
    image: () => drawPoster(n),
    scenery: asPaper(
      rooms.flatMap(({ room, mount }) =>
        boardFacets(mount, POSTER, room, placed(pose, room)),
      ),
      lookOf,
    ),
  }));

/** How far past a wall's face a quad still counts as the wall's own, in room sides. */
const WALL_SLACK = 1e-4;

/** `seen` as an eye looking through `far` sees it: the rooms past its wall alone. */
function sightBeyond(far: Facing, { near, above, ...rest }: Sight): Sight {
  const kept = near.filter((room) => isBeyond(far, room));
  const over = new Set(kept.map((room) => roomKey(parent(room))));
  return {
    ...rest,
    near: kept,
    above: above.filter((room) => over.has(roomKey(room))),
  };
}

/** `quads` of `far`'s frame without its own wall and door, which the eye looks through. */
const pastWall = (far: Facing, quads: readonly Quad[]): Quad[] =>
  quads.filter(({ corners }) =>
    corners.some(
      ([east, , south]) =>
        pastDoorway(far, east, south) > DOORWAY_DEEP + WALL_SLACK,
    ),
  );

/**
 * The mesh for an eye at `pose`, seeing through the door `opened` as its
 * opener alone does; given `through`, a portal's far side, only what lies
 * past that wall, and `pose` must be in the room past it. Its floor's holes
 * are resolved first, since they decide which rooms of the floor below it
 * sees, and only then those rooms' own; which rooms sell is read off the
 * same answers. What it awaits is resolved once per room, so a pill taken
 * re-packs the faces without resolving the holes again.
 */
export async function build(
  pose: Pose,
  copy: SignCopy,
  bought: Holdings,
  opened: Ajar | null,
  through: Facing | null = null,
): Promise<Mesh> {
  const whole = sight(pose, FAR, withOpen(walls, opened));
  const seen = through === null ? whole : sightBeyond(through, whole);
  const kept = (quads: readonly Quad[]): readonly Quad[] =>
    through === null ? quads : pastWall(through, quads);
  const holeAbove = await holesOf(planted, slabRooms(seen));
  const full = withBelow(seen, holeAbove);
  const holeBelow = await holesOf(planted, full.below);
  const holeOf: HoleOf = (room) =>
    room.n > pose.n ? holeBelow(room) : holeAbove(room);
  const signed = signsSeen(walls, bought, full, holeOf);
  const onFloor = new Map(
    signed
      .filter(({ room }) => room.n === pose.n)
      .map(({ room, sign }) => [roomKey(room), sign]),
  );
  const owns = (room: Room) => bought.has(roomKey(room));
  const posts = signed.flatMap(({ room, sign }) =>
    signPost(sign, room, placed(pose, room)),
  );
  const lookOf = roomLooks(pose, walls, rolledTraits);
  const settings = [...full.near, ...full.below].map((room) =>
    settingOf(walls, rolledTraits, room, holeOf(room)),
  );
  const things = settings.flatMap((setting) =>
    inPlace(
      furnish(setting, themeOf(setting.room.n).decor),
      placed(pose, setting.room),
    ),
  );
  return {
    faces: (taken) =>
      pack(
        kept([
          ...faces(rolled, pose, full, holeOf, taken, owns, pillarOf, opened),
          ...posts,
          ...things,
        ]),
        lookOf,
      ),
    stood: (moving) =>
      pack(
        [...Map.groupBy(moving, ({ room }) => roomKey(room)).values()].flatMap(
          (inRoom) =>
            inRoom[0] === undefined
              ? []
              : inPlace(inRoom, placed(pose, inRoom[0].room)),
        ),
        lookOf,
      ),
    boards: [
      ...signBoards(pose, signed, copy, lookOf),
      ...posterBoards(pose, landingsSeen(walls, full, holeOf), lookOf),
    ],
    // A frame whose door is another, or none, sees this one's leaf shut.
    leaf: (door) =>
      opened === null
        ? []
        : doorLeaf(
            opened,
            door !== null && isSameWall(door, opened)
              ? door
              : { ...opened, angle: 0 },
          ),
    signOf: (room) => onFloor.get(roomKey(room)) ?? null,
    settings,
  };
}

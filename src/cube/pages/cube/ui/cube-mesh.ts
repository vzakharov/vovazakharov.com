import { themeOf } from '@/cube/entities/theme';
import {
  boardFacets,
  faces,
  type Facet,
  type Holdings,
  type HoleOf,
  holesOf,
  inPlace,
  type InRoomOf,
  type Landing,
  landingsSeen,
  maze,
  mazeWalls,
  placed,
  planted,
  type Pose,
  priceOf,
  type Quad,
  type Room,
  roomKey,
  type Setting,
  settingOf,
  sight,
  type Sign,
  type Signed,
  signFacets,
  signPost,
  signsSeen,
  slabRooms,
  traits,
  withBelow,
} from '@/cube/entities/world';
import { furnish } from '@/cube/features/decor';

import type COPY from '../config/messages/en.json';
import { FAR } from '../lib/camera';
import { formatPrice } from '../lib/figures';
import { pack, type RoomLook, type Scenery } from '../lib/mesh';
import { roomLooks } from '../lib/room-look';
import { drawPoster, POSTER } from './poster-board';
import type { Boards } from './renderer';
import { drawBoard } from './sign-board';

type LookOf = (room: Room) => RoomLook;

/**
 * The sign of a room on the eye's floor, null where the room has none or the
 * scene has not resolved it yet.
 */
export type SignOf = (room: Room) => Sign | null;

/**
 * One room's view: its faces, the pill taken left off its shelf, its boards,
 * `stood`, a frame's moving quads where the view has their rooms, and the
 * settings of the rooms whose happenings it shows.
 */
export type Mesh = {
  faces: (taken: InRoomOf | null) => Scenery;
  stood: (moving: readonly Quad[]) => Scenery;
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
const walls = mazeWalls(rolled);
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

/**
 * The mesh for an eye at `pose`. Its floor's holes are resolved first, since
 * they decide which rooms of the floor below it sees, and only then those
 * rooms' own; which rooms sell is read off the same answers. What it awaits
 * is resolved once per room, so a pill taken re-packs the faces without
 * resolving the holes again.
 */
export async function build(
  pose: Pose,
  copy: SignCopy,
  bought: Holdings,
): Promise<Mesh> {
  const seen = sight(pose, FAR, walls);
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
        [
          ...faces(rolled, pose, full, holeOf, taken, owns, pillarOf),
          ...posts,
          ...things,
        ],
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
    signOf: (room) => onFloor.get(roomKey(room)) ?? null,
    settings,
  };
}

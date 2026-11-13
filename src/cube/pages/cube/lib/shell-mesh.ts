import { ROOM_METRES, WALL_HALF } from '@/cube/shared/lib/room-shape';
import {
  cross3,
  moved,
  scaled,
  type Vec2,
  type Vec3,
} from '@/cube/shared/lib/vec';
import {
  CUBE_BOX,
  DOOR_LADDER,
  DOORWAY_BOX,
  LADDER_ACROSS,
  LADDER_OUT,
  LADDER_UP,
} from '@/cube/shared/outside';

/** What a face of the shell is made of, as the shader's `kind` tells them apart. */
export const SHELL_KINDS = [
  'side',
  'top',
  'underside',
  'reveal',
  'stile',
  'rung',
] as const;

export type ShellKind = (typeof SHELL_KINDS)[number];

/**
 * A vertex of the shell, in buffer order: where it is in the world, the way
 * its face looks, where it is on its face in metres, and its face's kind.
 */
export const SHELL_VERTEX_FLOATS = 9;

/** How deep the doorway's reveal is: the wall from its outer face to its inner one. */
const REVEAL_METRES = ROOM_METRES * WALL_HALF;

/**
 * A flat rect: from `corner` along `u` then `v`, both in metres, facing the
 * way `u × v` does; `onFace` is its corner's place on its face.
 */
type Rect = { corner: Vec3; u: Vec3; v: Vec3; onFace: Vec2; kind: ShellKind };

function rectFloats({ corner, u, v, onFace, kind }: Rect): number[] {
  const [nx, ny, nz] = cross3(u, v);
  const long = Math.hypot(nx, ny, nz);
  const [wide, tall] = [Math.hypot(...u), Math.hypot(...v)];
  const code = SHELL_KINDS.indexOf(kind);
  const corners: Array<[number, number]> = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 0],
    [1, 1],
    [0, 1],
  ];
  return corners.flatMap(([a, b]) => [
    ...moved(moved(corner, u, a), v, b),
    nx / long,
    ny / long,
    nz / long,
    onFace[0] + a * wide,
    onFace[1] + b * tall,
    code,
  ]);
}

/** The three ways round a box's half-edges: the one a pair of faces looks along, then the two across them. */
const TURNS = [
  [0, 1, 2],
  [1, 2, 0],
  [2, 0, 1],
] as const;

/** A box about `middle`: its three half-edges, a right-handed three, and its faces' kind. */
function box(
  middle: Vec3,
  halves: readonly [Vec3, Vec3, Vec3],
  kind: ShellKind,
): Rect[] {
  return TURNS.flatMap(([along, first, second]) =>
    [1, -1].map((side): Rect => {
      const face = moved(middle, halves[along], side);
      // The far face is walked the other way round, so it too looks out.
      const [across, up] =
        side > 0
          ? [halves[first], halves[second]]
          : [halves[second], halves[first]];
      return {
        corner: moved(moved(face, across, -1), up, -1),
        u: scaled(across, 2),
        v: scaled(up, 2),
        onFace: [0, 0],
        kind,
      };
    }),
  );
}

/**
 * The cube's four sides, each from a top corner: `onFace` runs along the side and
 * down it, so the floors' bands read alike on all four. The east side runs
 * from its north end, as the doorway is told, and is cut round it.
 */
function sides(): Rect[] {
  const { min, max } = CUBE_BOX;
  const [wide, tall] = [max[0] - min[0], max[1] - min[1]];
  const down: Vec3 = [0, -tall, 0];
  const whole = (corner: Vec3, u: Vec3): Rect => ({
    corner,
    u,
    v: down,
    onFace: [0, 0],
    kind: 'side',
  });
  const door = {
    from: DOORWAY_BOX.min[2] - min[2],
    to: DOORWAY_BOX.max[2] - min[2],
    head: max[1] - DOORWAY_BOX.max[1],
    sill: max[1] - DOORWAY_BOX.min[1],
  };
  const east = (from: number, to: number, top: number, foot: number): Rect => ({
    corner: [max[0], max[1] - top, min[2] + from],
    u: [0, 0, to - from],
    v: [0, top - foot, 0],
    onFace: [from, top],
    kind: 'side',
  });
  return [
    whole([min[0], max[1], max[2]], [0, 0, -wide]),
    whole([max[0], max[1], max[2]], [-wide, 0, 0]),
    whole([min[0], max[1], min[2]], [wide, 0, 0]),
    east(0, door.from, 0, tall),
    east(door.to, wide, 0, tall),
    east(door.from, door.to, 0, door.head),
    east(door.from, door.to, door.sill, tall),
  ];
}

/** The top, looking up, and the underside, looking down, each told from the cube's north-west corner. */
function caps(): Rect[] {
  const { min, max } = CUBE_BOX;
  const wide = max[0] - min[0];
  return [
    {
      corner: [min[0], max[1], min[2]],
      u: [0, 0, wide],
      v: [wide, 0, 0],
      onFace: [0, 0],
      kind: 'top',
    },
    {
      corner: [min[0], min[1], min[2]],
      u: [wide, 0, 0],
      v: [0, 0, wide],
      onFace: [0, 0],
      kind: 'underside',
    },
  ];
}

/** The doorway's reveal: its two jambs and its head, from the outer face in to the room's wall. */
function reveal(): Rect[] {
  const { min, max } = DOORWAY_BOX;
  const [tall, wide] = [max[1] - min[1], max[2] - min[2]];
  const inward: Vec3 = [-REVEAL_METRES, 0, 0];
  const outer = CUBE_BOX.max[0];
  return [
    {
      corner: [outer, min[1], min[2]],
      u: [0, tall, 0],
      v: inward,
      onFace: [0, 0],
      kind: 'reveal',
    },
    {
      corner: [outer, min[1], max[2]],
      u: inward,
      v: [0, tall, 0],
      onFace: [0, 0],
      kind: 'reveal',
    },
    {
      corner: [outer, max[1], min[2]],
      u: [0, 0, wide],
      v: inward,
      onFace: [0, 0],
      kind: 'reveal',
    },
  ];
}

/** How many flat sides a rung's round is drawn with; the shader rounds their light. */
const RUNG_SIDES = 8;

/** A rung's round about `middle`, from stile to stile, its ends inside them. */
function round(middle: Vec3): Rect[] {
  const radius = DOOR_LADDER.rung.tall / 2;
  const spoke = (turn: number): Vec3 => {
    const angle = (turn / RUNG_SIDES) * 2 * Math.PI;
    return moved(
      scaled(LADDER_UP, radius * Math.cos(angle)),
      LADDER_OUT,
      radius * Math.sin(angle),
    );
  };
  const end = moved(middle, LADDER_ACROSS, -DOOR_LADDER.wide / 2);
  return Array.from({ length: RUNG_SIDES }, (_, turn): Rect => {
    const from = spoke(turn);
    return {
      corner: moved(end, from),
      u: scaled(LADDER_ACROSS, DOOR_LADDER.wide),
      v: moved(spoke(turn + 1), from, -1),
      onFace: [0, 0],
      kind: 'rung',
    };
  });
}

/** The ladder: two stiles, each a box of wood, and its rungs' rounds. */
function ladder(): Rect[] {
  const middle = moved(DOOR_LADDER.foot, LADDER_UP, DOOR_LADDER.length / 2);
  const stiles = [-1, 1].flatMap((side) =>
    box(
      moved(middle, LADDER_ACROSS, (side * DOOR_LADDER.wide) / 2),
      [
        scaled(LADDER_UP, DOOR_LADDER.length / 2),
        scaled(LADDER_ACROSS, DOOR_LADDER.stile.across / 2),
        scaled(LADDER_OUT, DOOR_LADDER.stile.through / 2),
      ],
      'stile',
    ),
  );
  const rungs = DOOR_LADDER.rungs.flatMap((rung) => round(rung));
  return [...stiles, ...rungs];
}

/** The shell's every triangle: the cube's six faces, the doorway's reveal and the ladder. */
export const shellVertices = (): Float32Array<ArrayBuffer> =>
  new Float32Array(
    [...sides(), ...caps(), ...reveal(), ...ladder()].flatMap((rect) =>
      rectFloats(rect),
    ),
  );

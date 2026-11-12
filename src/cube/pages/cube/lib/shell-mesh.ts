import { ROOM_METRES, WALL_HALF } from '@/cube/shared/lib/room-shape';
import type { Vec2, Vec3 } from '@/cube/shared/lib/vec';
import {
  CUBE_BOX,
  DOORWAY_BOX,
  LADDER,
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

type ShellKind = (typeof SHELL_KINDS)[number];

/**
 * A vertex of the shell, in buffer order: where it is in the world, the way
 * its face looks, where it is on its face in metres, and its face's kind.
 */
export const SHELL_VERTEX_FLOATS = 9;

/** How deep the doorway's reveal is: the wall from its outer face to its inner one. */
export const REVEAL_METRES = ROOM_METRES * WALL_HALF;

const added = (a: Vec3, b: Vec3, times = 1): Vec3 => [
  a[0] + b[0] * times,
  a[1] + b[1] * times,
  a[2] + b[2] * times,
];

const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/**
 * A flat rect: from `corner` along `u` then `v`, both in metres, facing the
 * way `u × v` does; `at` is its corner's place on its face.
 */
type Rect = { corner: Vec3; u: Vec3; v: Vec3; at: Vec2; kind: ShellKind };

function rectFloats({ corner, u, v, at, kind }: Rect): number[] {
  const [nx, ny, nz] = cross(u, v);
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
    ...added(added(corner, u, a), v, b),
    nx / long,
    ny / long,
    nz / long,
    at[0] + a * wide,
    at[1] + b * tall,
    code,
  ]);
}

/** A box about `middle`: its three half-edges, a right-handed three, and its faces' kind. */
function box(
  middle: Vec3,
  halves: readonly [Vec3, Vec3, Vec3],
  kind: ShellKind,
  at: Vec2,
): Rect[] {
  return [0, 1, 2].flatMap((axis) => {
    const [out, u, v] = [
      halves[axis],
      halves[(axis + 1) % 3],
      halves[(axis + 2) % 3],
    ] as [Vec3, Vec3, Vec3];
    return [1, -1].map((side): Rect => {
      const face = added(middle, out, side);
      // The far face is walked the other way round, so it too looks out.
      const [across, up] = side > 0 ? [u, v] : [v, u];
      return {
        corner: added(added(face, across, -1), up, -1),
        u: added([0, 0, 0], across, 2),
        v: added([0, 0, 0], up, 2),
        at,
        kind,
      };
    });
  });
}

/**
 * The cube's four sides, each from a top corner: `at` runs along the side and
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
    at: [0, 0],
    kind: 'side',
  });
  const door = {
    from: DOORWAY_BOX.min[2] - min[2],
    to: DOORWAY_BOX.max[2] - min[2],
    head: max[1] - DOORWAY_BOX.max[1],
    sill: max[1] - DOORWAY_BOX.min[1],
  };
  const east = (
    from: number,
    to: number,
    top: number,
    foot: number,
  ): Rect => ({
    corner: [max[0], max[1] - top, min[2] + from],
    u: [0, 0, to - from],
    v: [0, top - foot, 0],
    at: [from, top],
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
      at: [0, 0],
      kind: 'top',
    },
    {
      corner: [min[0], min[1], min[2]],
      u: [wide, 0, 0],
      v: [0, 0, wide],
      at: [0, 0],
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
      at: [0, 0],
      kind: 'reveal',
    },
    {
      corner: [outer, min[1], max[2]],
      u: inward,
      v: [0, tall, 0],
      at: [0, 0],
      kind: 'reveal',
    },
    {
      corner: [outer, max[1], min[2]],
      u: [0, 0, wide],
      v: inward,
      at: [0, 0],
      kind: 'reveal',
    },
  ];
}

/** The ladder: two stiles and its rungs, each a box of wood. */
function ladder(): Rect[] {
  const middle = added(LADDER.foot, LADDER_UP, LADDER.length / 2);
  const stiles = [-1, 1].flatMap((side) =>
    box(
      added(middle, LADDER_ACROSS, (side * LADDER.wide) / 2),
      [
        added([0, 0, 0], LADDER_UP, LADDER.length / 2),
        added([0, 0, 0], LADDER_ACROSS, LADDER.stile.across / 2),
        added([0, 0, 0], LADDER_OUT, LADDER.stile.through / 2),
      ],
      'stile',
      [0, 0],
    ),
  );
  const rungs = LADDER.rungs.flatMap((rung) =>
    box(
      rung,
      [
        added([0, 0, 0], LADDER_UP, LADDER.rung.tall / 2),
        added([0, 0, 0], LADDER_ACROSS, LADDER.wide / 2),
        added([0, 0, 0], LADDER_OUT, LADDER.rung.through / 2),
      ],
      'rung',
      [0, 0],
    ),
  );
  return [...stiles, ...rungs];
}

/** The shell's every triangle: the cube's six faces, the doorway's reveal and the ladder. */
export const shellVertices = (): Float32Array =>
  new Float32Array(
    [...sides(), ...caps(), ...reveal(), ...ladder()].flatMap(rectFloats),
  );

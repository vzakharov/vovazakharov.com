/**
 * Where the next mushroom may grow: a foot `pickFoot` draws over the stretch
 * of the world the screen shows now (`layoutShown`), kept only where the
 * mushroom grown there, of whichever species the child picks, keeps every
 * rule the meadow keeps. The meadow's rules are judged at the view's eye's
 * anchor (`anchorOf`), as the layout anchored there stands it
 * (`anchoredStand`): no more than `MUSHROOM_SLOTS` within `D_SEE` of its
 * foot or of the anchor (`isCrowdedAt`), its cap inside `EDGE_MARGIN` of the
 * world's edges, no cap or stem hidden behind the nearer ones past `MOST_HIDDEN`,
 * every door in sight (`doorInSight`), off every flower, and every mushroom
 * keeping a patch of its own a finger lands on (`keepsPatches`). The screen's
 * are judged as the current view draws it: its cap on screen `EDGE_MARGIN`
 * inside its edges, in front of the hills, and every control and the sun's
 * rays off it. A later turn or step may slide a cap under a control or the
 * sun, which stand on the screen: one more moves it out. The sun's wash
 * keeps off every foot (`washRings`).
 */

import { pick } from '@/shared/lib/collections';

import { anchorOf } from '../../model/anchor';
import { isCrowdedAt } from '../../model/crowding';
import {
  type Box,
  boxAround,
  type Circle,
  containsPoint,
  distanceToEdge,
  type Point,
} from '../../model/geometry';
import {
  anchored,
  type Eye,
  type Ground,
  groundFootOf,
  OPENING_EYE,
} from '../../model/ground';
import { EMPTY_HOUSE } from '../../model/house';
import { MUSHROOM_SPECIES, mushroomGenes } from '../../model/mushroom-genes';
import { type Splayed, splayed } from '../../model/mushroom-pose';
import {
  apartOnScreen,
  type Footed,
  grownOn,
  pickFoot,
  type WithOptionalSpan,
} from '../../model/placement';
import type { Seeded } from '../../model/random';
import { anchoredStand } from './anchored-stand';
import { aboutFoot } from './bed-place';
import { capBox } from './cap-cover';
import { FOREST_SPLAY, groundIn, placeOnGround } from './clump-layout';
import { type Standing, standingAs } from './door-sight';
import { layoutShown } from './eye-crop';
import { flowerFeet } from './flower-plots';
import type { Stand } from './flower-sight';
import type { MeadowLayout, Placement } from './layout';
import { EDGE_MARGIN } from './meadow-camera';
import {
  type Around,
  keepsPatches,
  patchesAround,
  patchTarget,
} from './mushroom-patch';
import { standingControls } from './sky-layout';
import { doorsKept, partsInView, standingOn } from './standing-weighed';
import { SUN_RAY_REACH } from './sun-layout';
import { tapReach } from './tap-reach';
import { behindHills, cull, ofLayout, type View } from './view';

/**
 * How close, as a camera lays the ground out (`apartOnScreen`), in the
 * clump's size, a mushroom's foot comes to a flower's. Holding it to the
 * rule a flower keeps off a mushroom's foot (`clearOfFeet`) instead leaves
 * room for six mushrooms among seven flowers in almost no visit.
 */
const FLOWER_APART = 0.2;

/**
 * What the view a `+` is pressed in holds a new mushroom to, whatever stands
 * in it: where across the world, in px, its cap stands between; the view,
 * whose screen it stands on, and every control's hit area, open pickers and
 * all, and the sun's rays, where they stand on that screen; and how far
 * across the ground its foot is drawn (`seen`). Absent a view, the whole
 * world, which no control stands over.
 */
type Screen = WithOptionalSpan & {
  stage: MeadowLayout;
  edges: Record<'left' | 'right', number>;
  view?: View;
  keepOff: readonly Circle[];
};

/** The anchor a `+` pressed in `view` judges the meadow from: the opening eye absent a view. */
function anchorIn(view: View | undefined): Eye {
  return view ? anchorOf(view.eye) : OPENING_EYE;
}

/**
 * `view` as the layout anchored at `anchor` holds it: its eye moved with the
 * anchor onto `OPENING_EYE` (`anchored`), so it draws the anchored layout as
 * `view` draws the plane.
 */
function viewFrom(anchor: Eye, view: View): View {
  const { eye } = view;
  return {
    ...view,
    eye: { ...anchored(anchor, eye), heading: eye.heading - anchor.heading },
  };
}

/** `stage` as a new mushroom is held to on it, in `view`. */
function screenOn(stage: MeadowLayout, view: View | undefined): Screen {
  const { camera, sun, picker, housePicker } = stage;
  const edges = { left: EDGE_MARGIN, right: camera.world - EDGE_MARGIN };
  if (!view) return { stage, edges, keepOff: [] };
  const shown = layoutShown(view);
  const across = (x: number) => (x - camera.midline) / camera.unit;
  return {
    stage,
    edges,
    view,
    keepOff: [
      ...[...standingControls(stage), ...picker, ...housePicker].map(
        (control) => ({ ...control, r: tapReach(control.r) }),
      ),
      { ...sun, r: sun.r * SUN_RAY_REACH },
    ],
    ...(shown && {
      within: { left: across(shown.left), right: across(shown.right) },
    }),
  };
}

/**
 * Whether a cap boxed by `cap`, in world px, on a mushroom whose foot the
 * layout stands at `laidFoot`, is drawn whole on `view`'s screen
 * `EDGE_MARGIN` inside its sides: its foot in front of the hills and far
 * enough ahead to be drawn.
 */
function capShown(view: View, cap: Box, laidFoot: Point): boolean {
  const { left, right, top, bottom } = cap;
  const foot = ofLayout(view, laidFoot, laidFoot.y);
  if (cull(foot) || behindHills(foot)) return false;
  return [left, right].every((x) =>
    [top, bottom].every((y) => {
      const at = aboutFoot(foot, laidFoot, { x, y });
      return (
        at.x >= EDGE_MARGIN &&
        at.x <= view.width - EDGE_MARGIN &&
        at.y >= 0 &&
        at.y <= view.height
      );
    }),
  );
}

/** How far `point` is from the closed `outline`: 0 inside it. */
function distanceTo(outline: readonly Point[], point: Point): number {
  return containsPoint(outline, point) ? 0 : distanceToEdge(outline, point);
}

/**
 * Whether every one of `circles`, on the screen, keeps off the drawn parts of
 * `own`, its foot laid out at `laidFoot`, as `view` draws them there.
 */
function keptOff(
  view: View,
  { drawn }: Standing,
  laidFoot: Point,
  circles: readonly Circle[],
): boolean {
  const foot = ofLayout(view, laidFoot, laidFoot.y);
  // A mushroom's drawn outlines are its tap area's parts (`TAP_PARTS`).
  const outlines = drawn.map((outline) => {
    const shown = outline.map((point) => aboutFoot(foot, laidFoot, point));
    return { outline: shown, box: boxAround(shown) };
  });
  return circles.every((circle) =>
    outlines.every(
      ({ outline, box }) =>
        circle.x + circle.r < box.left ||
        circle.x - circle.r > box.right ||
        circle.y + circle.r < box.top ||
        circle.y - circle.r > box.bottom ||
        distanceTo(outline, circle) >= circle.r,
    ),
  );
}

/** A new mushroom as one screen stands it on a foot, and the screen's rules. */
type Trial = {
  screen: Screen;
  place: Placement;
  stood: Splayed;
  own: Standing;
};

/**
 * `grown` stood on `foot` on `screen`, where its cap keeps the cheap rules,
 * standing between the world's `edges` and shown in the view; `undefined`
 * where it breaks one.
 */
function trialOn(
  screen: Screen,
  foot: Ground,
  grown: Splayed,
): Trial | undefined {
  const place = placeOnGround(screen.stage.camera, foot);
  const own = standingAs(place, grown);
  const cap = capBox(own);
  if (cap.left < screen.edges.left || cap.right > screen.edges.right) {
    return undefined;
  }
  if (screen.view && !capShown(screen.view, cap, place)) return undefined;
  return { screen, place, stood: grown, own };
}

/** Each species the mushroom grown from `seed` may be, by the splay it stands with. */
function speciesOf(seed: number): ReadonlyMap<number, readonly Splayed[]> {
  const grown = MUSHROOM_SPECIES.map((species) =>
    mushroomGenes({ seed, species }),
  );
  return new Map(
    [-FOREST_SPLAY, FOREST_SPLAY].map((splay) => [
      splay,
      grown.map((genes) => splayed(genes, splay)),
    ]),
  );
}

/**
 * The mushroom of every species in `splays` stood on `foot` over `screen`,
 * each inside its edges and off everything it keeps off; `undefined` where
 * one is not.
 */
function shownTrials(
  screen: Screen,
  foot: Ground,
  splays: ReadonlyMap<number, readonly Splayed[]>,
): Trial[] | undefined {
  const { splay } = placeOnGround(screen.stage.camera, foot);
  const species = splays.get(splay);
  if (!species) {
    throw new Error(`A forest mushroom stood with splay ${String(splay)}`);
  }
  const trials: Trial[] = [];
  for (const genes of species) {
    const trial = trialOn(screen, foot, genes);
    if (!trial) return undefined;
    trials.push(trial);
  }
  const { view, keepOff } = screen;
  return !view ||
    trials.every((trial) => keptOff(view, trial.own, trial.place, keepOff))
    ? trials
    : undefined;
}

/** The id a mushroom being tried is sought by among the meadow's. */
const TRIED = 'the tried mushroom';

/** The mushrooms `risen` stands, by the spores lying and the mushrooms standing it joined. */
const risings = new WeakMap<
  Stand['spores'],
  { mushrooms: Stand['mushrooms']; risen: Stand['mushrooms'] }
>();

/**
 * `stand` as it stands once every spore lying in it has come up, full-grown
 * at its foot: a spore always has room to sprout, so what comes after it is
 * judged against the mushroom it will be. The same array of mushrooms while
 * neither the mushrooms nor the spores change, so what is cached on it holds.
 */
function risen(stand: Stand): Stand {
  const { mushrooms, spores } = stand;
  if (spores.length === 0) return stand;
  const known = risings.get(spores);
  const all =
    known?.mushrooms === mushrooms
      ? known.risen
      : [
          ...mushrooms,
          ...spores.map((spore) => ({ ...spore, house: EMPTY_HOUSE })),
        ];
  risings.set(spores, { mushrooms, risen: all });
  return { ...stand, mushrooms: all, spores: [] };
}

/**
 * How far round its parent's foot a sprout's is drawn (`Near`), in the
 * clump's size as a camera lays the ground out.
 */
export const SPROUT_REACH = 1;

/**
 * Where the mushroom grown from `seed` grows in `stand`, as the scene and
 * the visit a sweep opens both find it, whichever species the child picks:
 * shown in `view`, or anywhere in the world absent one, judged from the
 * view's anchor (`anchorIn`) and grown there (`grownOn`); `undefined` where
 * there is no room left for one. The meadow is judged with every spore lying
 * in it come up (`risen`). It keeps off every flower standing there
 * (`flowerFeet`), and each foot is tried on the area cap and the cheap rules
 * first, then the controls, then what it hides and what hides it, then the
 * doors, then the patches, the dearest to try. A spore laid round the stored
 * foot `near` stands within `SPROUT_REACH` of it, judged at its full size
 * alone; `undefined` where the anchor has no ground under `near`.
 */
export function roomFor(
  stand: Stand,
  seed: number,
  view?: View,
  near?: Point,
): Footed | undefined {
  const anchor = anchorIn(view);
  const judged = anchoredStand(risen(stand), anchor);
  const { layout, mushrooms } = judged;
  const parent = near && groundIn(layout.mushrooms, near);
  if (near && !parent) return undefined;
  const flowers = flowerFeet(judged).map((foot) => groundFootOf(foot));
  const screen = screenOn(layout, view && viewFrom(anchor, view));
  const others = standingOn(mushrooms, layout.mushrooms);
  const splays = speciesOf(seed);
  let around: Around | undefined;
  const aroundNow = (): Around => (around ??= patchesAround(judged));
  const found = pickFoot(seed, {
    ...pick(layout.mushrooms, 'frame'),
    ...pick(screen, 'within'),
    ...(parent && { near: { ground: parent, reach: SPROUT_REACH } }),
    feet: mushrooms.flatMap(
      ({ foot }) => groundIn(layout.mushrooms, foot) ?? [],
    ),
    admits: (foot) => {
      if (
        isCrowdedAt(stand, grownOn(anchor, foot).foot, anchor) ||
        flowers.some((flower) => apartOnScreen(foot, flower) < FLOWER_APART)
      ) {
        return false;
      }
      const trials = shownTrials(screen, foot, splays);
      return (
        trials !== undefined &&
        trials.every((trial) => partsInView(trial.own, others)) &&
        trials.every((trial) => doorsKept(trial.own, others)) &&
        trials.every(({ place, stood }) =>
          keepsPatches(patchTarget(TRIED, place, stood), foot, aroundNow()),
        )
      );
    },
  });
  return found && grownOn(anchor, found);
}

/**
 * Whether the mushroom grown from `seed` on `footed`, of every species, still
 * stands shown in `view` and off every control and the sun's rays on its
 * screen, judged from the view's anchor: all of `roomFor`'s rules that a
 * turn or a step changes.
 */
export function fitsView(
  { layout }: Stand,
  seed: number,
  { foot }: Footed,
  view?: View,
): boolean {
  const anchor = anchorIn(view);
  const ground = groundIn({ ...layout.mushrooms, anchor }, foot);
  return (
    ground !== undefined &&
    shownTrials(
      screenOn(layout, view && viewFrom(anchor, view)),
      ground,
      speciesOf(seed),
    ) !== undefined
  );
}

/** What a room was found in, where, and the eye it was found from. */
type Found = Stand &
  Seeded & { foot: Footed | undefined; eye: Eye | undefined };

/** What of a stand the room in it is found from. */
const FOUND_FROM = [
  'layout',
  'flowers',
  'mushrooms',
  'spores',
  'planted',
  'pulled',
] as const;

/** Whether two eyes, either absent for the whole world, stand and face alike. */
const sameEye = (a: Eye | undefined, b: Eye | undefined) =>
  a === b ||
  (b !== undefined && a?.x === b.x && a.y === b.y && a.heading === b.heading);

/**
 * `find` answered again only once the stand it answered for, or the seed,
 * changes — a new layout after any resize, the mushrooms, the spores, the plantings,
 * the flowers pulled up or the seeded flowers — or a turn or a step leaves it wanting: a foot found
 * stays while it `fits` the view it is asked for, and no room found stays
 * while the eye stands where it did. A turn or a step never makes a new
 * layout, so it never costs a search while the room found stays in sight.
 */
export function keptRoom(
  find: typeof roomFor = roomFor,
  fits: typeof fitsView = fitsView,
): typeof roomFor {
  let found: Found | undefined;
  return (stand, seed, view) => {
    const eye = view?.eye;
    if (
      found?.seed === seed &&
      FOUND_FROM.every((key) => found?.[key] === stand[key]) &&
      (found.foot
        ? fits(stand, seed, found.foot, view)
        : sameEye(found.eye, eye))
    ) {
      return found.foot;
    }
    const foot = find(stand, seed, view);
    found = { ...stand, seed, foot, eye };
    return foot;
  };
}

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type Perch, perchName } from '../../model/flight';
import { type Aloft, centreOf, framedOf } from '../../model/flight-frame';
import { entryOf, isShown, nearerSide, outWay } from '../../model/flight-in';
import { apartIn, placesSetOff } from '../../model/flight-timing';
import { CLUMP_DISTANCE, OPENING_EYE } from '../../model/ground';
import { INSECT_KINDS } from '../../model/insect-genes';
import type { Stand } from './flower-sight';
import {
  awayDown,
  entryAloft,
  leavingAloft,
  legEnd,
  offAloft,
  PAST_BROW,
  reachesScreen,
  releasedAway,
  seenFor,
} from './insect-away';
import { aloftAt, drawnAloft, eyeFrameOf, mixD } from './insect-frame';
import { meadowCamera } from './meadow-camera';
import { footRows, onscreenOf, seatAt } from './perch-sight';
import { Perches } from './perches';
import { aloftOfLayout, perchDistance, placeOfAloft } from './plane-place';
import { D_SEE, onScreen, placedAt, V_NEAR, type View, viewAt } from './view';
import { VIEWPORTS } from './viewports';
import { opened } from './visit-play';

/** How an insect stands away: its span past an edge, and the height it flies at. */
const AWAY = { span: 40, drop: 150 };

/** `AWAY`, as `legEnd` asks for it. */
const standsAway = () => AWAY;

/** The screens the legs' timing is swept over: a whole visit's perches on each. */
const LEG_SCREENS = VIEWPORTS.filter(
  ([name]) => name === 'tablet' || name === 'phone',
);

/** `stand`'s perches, seen with no beds behind them, and each one's foot row. */
function perchedOn(stand: Stand) {
  const perches = new Perches(() => ({ bed: undefined, flowers: undefined }));
  perches.see(stand);
  return { perches, rows: footRows(stand) };
}

/**
 * Asserts the leg from `from` to `to` is drawn within `slack` of `timed`, in
 * insect sizes of `unit` px: the timing and the drawing agree.
 */
function assertPaced(
  view: View,
  [from, to]: readonly [Aloft, Aloft],
  unit: number,
  timed: number,
  slack: number,
  what: string,
): void {
  const pace = framedLength(view, from, to) / unit / timed;
  assert.ok(
    Math.abs(pace - 1) < slack,
    `${what}: drawn ×${pace.toFixed(2)} its timing`,
  );
}

describe('reachesScreen', () => {
  it('hides an insect only once a span each way round its middle has left the screen', () => {
    const view = viewAt(meadowCamera(1180, 820), OPENING_EYE);
    for (const zoom of [0.5, 1, 3]) {
      const reach = 40 * zoom;
      for (const [x, y] of [
        [-reach, 400],
        [1180 + reach, 400],
        [590, -reach],
        [590, 820 + reach],
      ] as const) {
        assert.equal(reachesScreen(view, { x, y, zoom }, 40), true);
        const outward = {
          x: x + Math.sign(x - 590),
          y: y + Math.sign(y - 410),
        };
        assert.equal(
          reachesScreen(view, { ...outward, zoom }, 40),
          false,
          `${String(x)} ${String(y)}`,
        );
      }
    }
  });
});

/** Eyes the way in is taken from: the opening, and beyond the forest, each facing the clump and looking back. */
const ENTRY_EYES = [0, 0.3, Math.PI, Math.PI - 0.035, Math.PI + 0.035].flatMap(
  (heading) => [
    { ...OPENING_EYE, heading },
    { x: 0, y: 18, heading },
  ],
);

/** Eyes walked into the forest and turned, from which the screen still shows caps. */
const WALKED_EYES = [
  { x: 0, y: 3, heading: 0 },
  { x: 1.5, y: 2, heading: 0.3 },
  { x: -1, y: 1, heading: -0.6 },
];

describe('entryAloft', () => {
  it('sets off on the ground just past the brow, halfway to a seat the screen shows, with no way out', () => {
    for (const [, width, height] of VIEWPORTS) {
      for (const eye of ENTRY_EYES) {
        const view = viewAt(meadowCamera(width, height), eye);
        for (const share of [0.1, 0.5, 0.9]) {
          const seated = { x: width * share, y: height * 0.6 };
          const { from, out } = entryAloft(view, 'left', AWAY, seated);
          assert.equal(out, undefined);
          assert.equal(from.h, 0);
          const distance = Math.hypot(from.x - eye.x, from.y - eye.y);
          assert.ok(Math.abs(distance - D_SEE - PAST_BROW) < 1e-9);
          const foot = placedAt(view, from, 0, CLUMP_DISTANCE);
          assert.ok(Math.abs(foot.x - (width / 2 + seated.x) / 2) < 1e-6);
          // Under the brow on its first frame, over it once it nears.
          assert.equal(drawnAloft(view, from), undefined);
        }
      }
    }
  });

  it('flies out past the edge its seat is drawn beyond, drawn there looking back', () => {
    for (const [, width, height] of VIEWPORTS) {
      for (const eye of ENTRY_EYES) {
        const view = viewAt(meadowCamera(width, height), eye);
        const cases = [
          { seated: { x: -80, y: height * 0.6 }, past: 'left' },
          { seated: { x: width + 80, y: height * 0.6 }, past: 'right' },
          { seated: { x: width * 0.7, y: height + 50 }, past: 'right' },
          { seated: undefined, past: 'left' },
        ] as const;
        for (const { seated, past } of cases) {
          const { from, out } = entryAloft(view, 'left', AWAY, seated);
          const foot = placedAt(view, from, 0, CLUMP_DISTANCE);
          assert.ok(Math.abs(foot.x - width / 2) < 1e-6);
          assert.ok(out, 'a way out');
          const drawn = drawnAloft(view, out);
          assert.ok(drawn, 'drawn');
          const edge = past === 'left' ? -AWAY.span : width + AWAY.span;
          assert.ok(Math.abs(drawn.x - edge) < 1e-6, `${drawn.x}`);
          assert.ok(Math.abs(drawn.y - AWAY.drop) < 1e-6, `${drawn.y}`);
          assert.ok(!onScreen(view, drawn));
        }
      }
    }
  });

  for (const [name, width, height] of LEG_SCREENS) {
    it(`sets a release off into every cap in view as far as its leg is timed (entryOf), from an eye walked and turned, on a ${name} screen`, () => {
      const stand = opened(3, width, height, true);
      const { layout, mushrooms } = stand;
      const { perches, rows } = perchedOn(stand);
      let legs = 0;
      for (const eye of [OPENING_EYE, ...WALKED_EYES]) {
        const view = viewAt(layout.camera, eye);
        const { places } = perches.sightFrom(view);
        const onscreen = onscreenOf(layout, view);
        assert.ok(places && onscreen);
        for (const { id } of mushrooms) {
          const cap: Perch = { kind: 'cap', id };
          const [seat, row] = [seatAt(stand, cap, 0), rows.get(perchName(cap))];
          const place = places[perchName(cap)];
          if (!seat || row === undefined || !place) continue;
          if (!isShown(onscreen, place)) continue;
          const to = aloftOfLayout(layout.camera, seat, row);
          const side = nearerSide(onscreen, place);
          const { from, out } = entryAloft(view, side, AWAY, seenFor(view, to));
          if (out) continue;
          const away: Perch = { kind: 'away', side };
          const timed = apartIn(
            entryOf(places, onscreen, side, cap),
            away,
            cap,
          );
          assert.ok(timed !== undefined, id);
          assertPaced(
            view,
            [from, to],
            layout.insectSize,
            timed,
            0.1,
            `${id} from ${JSON.stringify(eye)}`,
          );
          legs++;
        }
      }
      assert.ok(legs > 5, `only ${String(legs)} releases into a cap in view`);
    });
  }
});

/** The framed chord from `from` to `to` as the view draws it, in px at its own size: each cut over its zoom there. */
function framedLength(view: View, from: Aloft, to: Aloft): number {
  const centre = centreOf(view.eye, from, to);
  const [start, end] = [
    framedOf(eyeFrameOf(view), centre, from),
    framedOf(eyeFrameOf(view), centre, to),
  ];
  const [cuts, chord] = [100, Math.hypot(end.x - start.x, end.y - start.y)];
  let length = 0;
  for (let cut = 0; cut < cuts; cut++) {
    const forward = mixD(start.forward, end.forward, (cut + 0.5) / cuts);
    length += ((chord / cuts) * forward) / CLUMP_DISTANCE;
  }
  return length;
}

describe('leavingAloft', () => {
  for (const [name, width, height] of LEG_SCREENS) {
    it(`is as far from every cap in view as a leg out to it is timed, at either end of the band, on a ${name} screen`, () => {
      const stand = opened(3, width, height, true);
      const { layout, mushrooms } = stand;
      const { perches, rows } = perchedOn(stand);
      let legs = 0;
      // Phases sending it out at the band's top and its bottom.
      for (const phase of [-Math.PI / 6, Math.PI / 6]) {
        const away = { span: 30, drop: awayDown(height, phase) };
        for (const eye of [OPENING_EYE, ...WALKED_EYES]) {
          const view = viewAt(layout.camera, eye);
          const sight = perches.sightFrom(
            view,
            new Map(),
            new Map([['fly-1', away]]),
          );
          const onscreen = onscreenOf(layout, view);
          assert.ok(onscreen);
          for (const { id } of mushrooms) {
            const cap: Perch = { kind: 'cap', id };
            const [seat, row] = [
              seatAt(stand, cap, 0),
              rows.get(perchName(cap)),
            ];
            const landed = { from: cap, to: cap, departs: 0, arrives: 0 };
            const places = placesSetOff(sight, landed, 1, 'fly-1');
            const place = places?.[perchName(cap)];
            if (!seat || row === undefined || !place) continue;
            if (!isShown(onscreen, place)) continue;
            const from = aloftOfLayout(layout.camera, seat, row);
            for (const side of ['left', 'right'] as const) {
              const to = leavingAloft(view, side, away, from);
              const timed = apartIn(places, cap, { kind: 'away', side });
              assert.ok(timed !== undefined, id);
              assertPaced(
                view,
                [from, to],
                layout.insectSize,
                timed,
                0.05,
                `${id} ${side} from ${JSON.stringify(eye)} at drop ${away.drop.toFixed(0)}`,
              );
              legs++;
            }
          }
        }
      }
      assert.ok(legs > 10, `only ${String(legs)} legs out from a cap in view`);
    });
  }
});

describe('legEnd', () => {
  it('keeps a leaving flight’s end where it was fixed as it set off, however the eye turns after it', () => {
    const camera = meadowCamera(1180, 820);
    const setOff = viewAt(camera, OPENING_EYE);
    const from = aloftAt(setOff, { x: 760, y: 520 }, CLUMP_DISTANCE);
    for (const [side, turn] of [
      ['right', 1],
      ['left', -1],
    ] as const) {
      const to: Perch = { kind: 'away', side };
      // Frame by frame, as `InsectView` flies it: last frame's end is kept.
      let kept: Aloft | undefined;
      let first: Aloft | undefined;
      for (const heading of [0, 0.3, 0.6, 0.9, 1.2, 1.5]) {
        const view = viewAt(camera, {
          ...OPENING_EYE,
          heading: turn * heading,
        });
        const end = legEnd(view, to, standsAway, { from, kept });
        first ??= end;
        kept = end;
        assert.deepEqual(end, first, `${side} at ${String(heading)}`);
        const depth = perchDistance(view, end);
        assert.ok(
          depth > perchDistance(setOff, end) - 1e-9 && depth > V_NEAR * 1.5,
          `${side} turned ${String(heading)}: depth ${depth.toFixed(2)}`,
        );
      }
      assert.deepEqual(first, leavingAloft(setOff, side, AWAY, from));
    }
  });

  it('ends a leg to a perch where the perch stands now, else where it stood last, else where it set off', () => {
    const view = viewAt(meadowCamera(1180, 820), OPENING_EYE);
    const at = (x: number) => aloftAt(view, { x, y: 400 }, CLUMP_DISTANCE);
    const [from, kept, perch] = [at(100), at(300), at(500)];
    const cap: Perch = { kind: 'cap', id: 'm' };
    assert.equal(legEnd(view, cap, standsAway, { from, kept, perch }), perch);
    assert.equal(legEnd(view, cap, standsAway, { from, kept }), kept);
    assert.equal(legEnd(view, cap, standsAway, { from }), from);
  });
});

describe('onscreenOf, for a release', () => {
  for (const [name, width, height] of LEG_SCREENS) {
    it(`times a release's way out of view to where it flies out by, at its own span and height, on a ${name} screen`, () => {
      const { layout } = opened(3, width, height, true);
      const unit = layout.insectSize;
      let moved = 0;
      for (const eye of [OPENING_EYE, ...WALKED_EYES]) {
        const view = viewAt(layout.camera, eye);
        const middle = onscreenOf(layout, view);
        assert.ok(middle);
        for (const kind of INSECT_KINDS) {
          for (const seed of [7, 0x5e_ed, 0xc0_ff_ee_00]) {
            const insect = { kind, seed };
            const onscreen = onscreenOf(layout, view, insect);
            assert.ok(onscreen);
            const away = releasedAway(layout, view, insect);
            for (const side of ['left', 'right'] as const) {
              const { from, out } = entryAloft(view, side, away);
              assert.ok(out);
              const drawn = placeOfAloft(view, unit, out);
              assert.deepEqual(onscreen.outs[side], drawn);
              assertPaced(
                view,
                [from, out],
                unit,
                outWay(onscreen, side),
                0.1,
                `${kind} ${String(seed)} ${side} from ${JSON.stringify(eye)}`,
              );
              const { x, y } = middle.outs[side];
              if (Math.hypot(drawn.x - x, drawn.y - y) > 0.01) moved++;
            }
          }
        }
      }
      assert.ok(moved > 0, 'no release flies out off the band-middle spot');
    });
  }
});

describe('offAloft', () => {
  it('stands past either edge at the drop, the depth asked from the eye', () => {
    const view = viewAt(meadowCamera(1180, 820), { x: 0, y: 18, heading: 3 });
    for (const side of ['left', 'right'] as const) {
      const off = offAloft(view, side, AWAY, 6);
      assert.ok(Math.abs(perchDistance(view, off) - 6) < 1e-9);
      const drawn = drawnAloft(view, off);
      assert.ok(drawn);
      assert.ok(side === 'left' ? drawn.x < 0 : drawn.x > 1180);
    }
  });
});

describe('seenFor', () => {
  it('is where the view draws a point it draws, else just past the side the eye turns by to face it', () => {
    const view = viewAt(meadowCamera(1180, 820), OPENING_EYE);
    const at = { x: 300, y: 400 };
    const seen = seenFor(view, aloftAt(view, at, CLUMP_DISTANCE));
    assert.ok(Math.hypot(seen.x - at.x, seen.y - at.y) < 1e-6);
    for (const [x, side] of [
      [-0.5, 'left'],
      [0.5, 'right'],
    ] as const) {
      const behind = seenFor(view, { x, y: -5, h: 0.1 });
      assert.equal(behind.x < 0 ? 'left' : 'right', side);
      assert.equal(onScreen(view, behind), false);
    }
  });
});

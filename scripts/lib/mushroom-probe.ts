/**
 * What `play-mushrooms.ts` installs in the page it plays, and the schemas its
 * answers are parsed with. The page-side sources are strings evaluated there,
 * so they reach into the scene's own fields, and a rename in the scene breaks
 * them only at play time. The answers' schemas derive from the model's own
 * arrays, so the caller runs under tsx, which resolves the model's imports.
 */

import { z } from 'zod';

import {
  type Perch as ModelPerch,
  type PerchKind,
  SIDES,
} from '../../src/pages/mushrooms/model/flight.ts';
import { wrap } from '../../src/pages/mushrooms/model/geometry.ts';
import type { Camera as ModelCamera } from '../../src/pages/mushrooms/model/ground.ts';
import { INSECT_KINDS } from '../../src/pages/mushrooms/model/insect-genes.ts';
import { MUSHROOM_SPECIES } from '../../src/pages/mushrooms/model/mushroom-genes.ts';
import { SHELTER_SEATS } from '../../src/pages/mushrooms/model/shelter.ts';
import { PUFF_REACH } from '../../src/pages/mushrooms/ui/scene/cloud-puffs.ts';

/** Swaps `Math.random` for a mulberry32 seeded with `seed` before the page's own code runs. */
export function seededRandom(seed: number): string {
  return `(() => {
  let state = ${String(seed)} >>> 0;
  Math.random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();`;
}

/**
 * Puts every scene's tweens on the stepped game clock, installed once the game
 * is up. Phaser times tweens by `Date.now()` with a lag skip, so under a
 * stepped loop a frame would show a puff or a drift wherever the wall clock
 * left it rather than where that frame's game time puts it.
 */
export const STEPPED_TWEENS = `(() => {
  const game = window.__game;
  let stepped;
  for (const name of ['headlessStep', 'step']) {
    const run = game[name].bind(game);
    game[name] = (time, delta) => {
      stepped = time;
      return run(time, delta);
    };
  }
  for (const { tweens } of game.scene.scenes) {
    let last = stepped;
    tweens.getDelta = () => {
      const delta = last === undefined || stepped === undefined ? 0 : stepped - last;
      last = stepped;
      tweens.time = (stepped ?? 0) / 1000;
      return delta;
    };
  }
  return true;
})()`;

/** Page-side helpers, installed as `window.__probe` once the game is up. */
export const PROBE = `(() => {
  const scene = window.__game.scene.scenes[0];
  const centre = ({ x, y }) => ({ x, y });
  const finite = (at) => (Number.isFinite(at) ? at : null);
  /**
   * A point of the camera's world where the screen shows it now, and back:
   * the eye's view places everything on the screen, and the camera scrolls
   * only by the walk's bob, down the screen.
   */
  const toScreen = ({ x, y }) => {
    const { scrollX, scrollY } = scene.cameras.main;
    return { x: x - scrollX, y: y - scrollY };
  };
  const toWorld = ({ x, y }) => {
    const { scrollX, scrollY } = scene.cameras.main;
    return { x: x + scrollX, y: y + scrollY };
  };
  /** Whether the screen shows the camera's world x across it. */
  const shows = (x) => {
    const across = toScreen({ x, y: 0 }).x;
    return across >= 0 && across <= scene.layout.width;
  };
  /** The middle of a turning picture's shown columns across the screen, \`null\` while the view leaves it out. */
  const middleShown = ({ columns }) => {
    const shown = columns.filter((column) => column.visible);
    if (shown.length === 0) return null;
    const left = Math.min(...shown.map((column) => column.x));
    const right = Math.max(
      ...shown.map((column) => column.x + column.displayWidth),
    );
    const middle = toScreen({ x: (left + right) / 2, y: 0 }).x;
    return middle >= 0 && middle <= scene.layout.width ? middle : null;
  };
  // Every footstep the walk sounds, counted whether or not the sound is on.
  const step = scene.voice.step.bind(scene.voice);
  let steps = 0;
  scene.voice.step = (foot) => {
    steps += 1;
    step(foot);
  };
  // Every lawn-tending call and perch re-sight, timed for \`hitches()\`. The
  // private methods are timed on the instance, which \`follow\`'s \`this.\`
  // calls reach first, and the tending on the grass's \`Tended\`. A call
  // made inside another timed into the same list counts in that one alone.
  const hitches = { tend: [], see: [] };
  const depths = new Map();
  const timing = (owner, name, into) => {
    const run = owner[name].bind(owner);
    owner[name] = (...args) => {
      const depth = depths.get(into) ?? 0;
      depths.set(into, depth + 1);
      const started = performance.now();
      const result = run(...args);
      depths.set(into, depth);
      if (depth === 0) into.push(performance.now() - started);
      return result;
    };
  };
  for (const name of ['whole', 'change', 'retend', 'tendOn']) {
    timing(scene.grass.tended, name, hitches.tend);
  }
  timing(scene, 'see', hitches.see);
  // Every frame whose update ran a tending call, for \`tendFrames()\`: the
  // update's ms, which a headless frame's own timing leaves out, and the
  // tending calls' share of it. Phaser calls the update it took at boot,
  // \`sys.sceneUpdate\`.
  const tendFrames = [];
  const sceneUpdate = scene.sys.sceneUpdate;
  scene.sys.sceneUpdate = function (...args) {
    const tends = hitches.tend.length;
    const started = performance.now();
    sceneUpdate.apply(this, args);
    if (hitches.tend.length > tends) {
      const ms = performance.now() - started;
      const tend = hitches.tend.slice(tends).reduce((sum, one) => sum + one, 0);
      tendFrames.push({ ms, tend });
    }
  };
  // Every frame's update and render, and the parts of the update by
  // \`owner.name\`, summed for \`costs()\`; a part called inside another
  // counts in both.
  const costs = { frames: 0, ms: {} };
  // Called on whatever \`this\` its caller gives: Phaser calls the scene's
  // update on the scene, not on \`sys\`, which holds it.
  const costing = (owner, label, name) => {
    const run = owner[name];
    owner[name] = function (...args) {
      const started = performance.now();
      const result = run.apply(this, args);
      costs.ms[label] = (costs.ms[label] ?? 0) + performance.now() - started;
      return result;
    };
  };
  costing(scene.sys, 'update', 'sceneUpdate');
  costing(window.__game.scene, 'render', 'render');
  for (const name of ['walk', 'sow', 'see', 'dispatch', 'sightNow']) {
    costing(scene, name, name);
  }
  for (const part of ['grass', 'bed', 'flowers', 'insects', 'controls', 'rain']) {
    for (const name of ['follow', 'update']) {
      if (scene[part][name]) costing(scene[part], part + '.' + name, name);
    }
  }
  costing(scene.perches, 'perches.sightFrom', 'sightFrom');
  const counted = scene.sys.sceneUpdate;
  scene.sys.sceneUpdate = function (...args) {
    costs.frames += 1;
    counted.apply(this, args);
  };
  /** The middle of \`points\`, in \`graphics\`' frame, on screen. */
  const onScreen = (graphics, points) => {
    const x = points.reduce((sum, point) => sum + point.x, 0) / points.length;
    const y = points.reduce((sum, point) => sum + point.y, 0) / points.length;
    return toScreen(graphics.getWorldTransformMatrix().transformPoint(x, y, {}));
  };
  // Phaser's graphics commands by code, with how many numbers follow each.
  const ARGS = { 0: 7, 3: 4, 4: 2, 5: 2, 6: 3, 7: 2, 10: 6, 11: 6, 16: 2, 17: 2, 18: 1 };
  /** How far across \`graphics\` paints, in CSS px, from its paths and circles: \`null\` past a command not in \`ARGS\`. */
  const spanAcross = (graphics) => {
    const xs = [];
    const buffer = graphics.commandBuffer;
    for (let at = 0; at < buffer.length; ) {
      const code = buffer[at];
      const args = [1, 2, 8, 9, 14, 15].includes(code) ? 0 : ARGS[code];
      if (args === undefined) return null;
      if (code === 4 || code === 5) xs.push(buffer[at + 1]);
      if (code === 0) xs.push(buffer[at + 1] - buffer[at + 3], buffer[at + 1] + buffer[at + 3]);
      at += 1 + args;
    }
    return xs.length === 0 ? null : (Math.max(...xs) - Math.min(...xs)) * graphics.scaleX;
  };
  /**
   * What a tap at a point on screen reaches, by the scene's own hit test and
   * its topmost-only rule, the top insect handing it to the one whose body is
   * nearest (\`reached\`): \`insect:<id>\`, \`door:<id>\`, \`window:<id>:<index>\`,
   * \`mushroom:<id>\`, \`other\`, or \`null\` for the bare meadow. With
   * \`drawn\` set, the tap stays with the insect drawn on top.
   */
  const topAt = ({ x, y, drawn = false }) => {
    const pointer = { x: scene.scale.transformX(x), y: scene.scale.transformY(y) };
    const [top] = scene.input.sortGameObjects(
      [...scene.input.hitTestPointer(pointer)],
      pointer,
    );
    if (!top) return null;
    for (const [id, shown] of scene.insects.shown) {
      if (top !== shown.container) continue;
      return 'insect:' + (drawn ? id : (scene.insects.reached(toWorld({ x, y })) ?? id));
    }
    for (const [id, shown] of scene.bed.shown) {
      if (top === shown.house.graphics) {
        // The hit test leaves the point in the graphics' own frame on its input.
        const part = shown.house.takes({ x: top.input.localX, y: top.input.localY });
        return part === 'door' ? 'door:' + id : 'window:' + id + ':' + part;
      }
      if (top === shown.graphics) return 'mushroom:' + id;
    }
    return 'other';
  };
  /**
   * Of a grid over \`points\`' box, in \`graphics\`' frame, the point on
   * screen nearest their middle whose tap reaches one of \`labels\`
   * (\`topAt\`): where the thing shows, however much of it stands behind
   * something else. \`null\` where none does.
   */
  const reaching = (graphics, points, labels) => {
    const middle = onScreen(graphics, points);
    const xs = points.map(({ x }) => x);
    const ys = points.map(({ y }) => y);
    const [left, right] = [Math.min(...xs), Math.max(...xs)];
    const [top, bottom] = [Math.min(...ys), Math.max(...ys)];
    const matrix = graphics.getWorldTransformMatrix();
    const grid = [];
    for (let i = 0; i <= 16; i++) {
      for (let j = 0; j <= 16; j++) {
        grid.push(
          toScreen(
            matrix.transformPoint(
              left + ((right - left) * i) / 16,
              top + ((bottom - top) * j) / 16,
              {},
            ),
          ),
        );
      }
    }
    const away = ({ x, y }) => Math.hypot(x - middle.x, y - middle.y);
    const [nearest] = grid
      .filter((point) => labels.includes(topAt(point)))
      .sort((a, b) => away(a) - away(b));
    return nearest ?? null;
  };
  window.__probe = {
    scene,
    toScreen,
    toWorld,
    shows,
    /**
     * Where the eye stands and which way it looks, how far it has walked,
     * the camera's bob, the footsteps sounded since the probe went in, and
     * the screen and the clump's size it is seen on.
     */
    eye: () => {
      const { x, y, heading } = scene.eye.eye();
      return {
        x,
        y,
        heading,
        walked: scene.eye.walked(),
        bob: scene.cameras.main.scrollY,
        steps,
        width: scene.layout.width,
        height: scene.layout.height,
        unit: scene.layout.camera.unit,
      };
    },
    /** The lawn's tending calls and the re-sights timed since the last call, in ms, and forgotten. */
    hitches: () => {
      const taken = { tend: hitches.tend.splice(0), see: hitches.see.splice(0) };
      return taken;
    },
    /** Each frame since the last call whose update ran a lawn-tending call, forgotten: its update ms and the tending's share. */
    tendFrames: () => tendFrames.splice(0),
    /**
     * The frames updated since the last call, forgotten, the ms their
     * updates, renders and the update's parts took in all, and how many
     * things the scene holds now.
     */
    costs: () => {
      const taken = { frames: costs.frames, ms: costs.ms };
      costs.frames = 0;
      costs.ms = {};
      const size = (held) => (held ? (held.size ?? held.length ?? 0) : 0);
      const counts = {
        objects: scene.children.list.length,
        visible: scene.children.list.filter((one) => one.visible).length,
        insects: size(scene.insects.shown),
        flowers: size(scene.flowers.shown),
        mushrooms: size(scene.bed.shown),
        tufts: size(scene.grass.tended.standing()),
        mottles: size(scene.grass.lawn?.mottles),
        placed: size(scene.perches.placed),
        air: size(scene.perches.sight.air),
        planted: size(scene.meadow.planted),
      };
      return { ...taken, counts };
    },
    /** How many flowers bees have planted on the meadow. */
    beePlanted: () =>
      scene.meadow.planted.filter((sown) => 'parent' in sown).length,
    /** Where the sun's picture stands across the screen, in CSS px; \`null\` while the view leaves it out. */
    sun: () => middleShown(scene.backdrop.sun),
    /** Where the rainbow's picture stands across the screen, as \`sun\`. */
    rainbowAt: () => middleShown(scene.backdrop.rainbow),
    state: () => ({
      picking: scene.meadow.picking,
      furnishing: scene.meadow.furnishing,
      houses: scene.meadow.mushrooms.map(({ house }) => ({
        windows: [...house.windows],
        door: house.door,
      })),
      selected: scene.meadow.selected ?? null,
      mushrooms: scene.meadow.mushrooms.map(({ id }) => id),
      species: scene.meadow.mushrooms.map(({ species }) => species),
      mapOpen: scene.map.open,
      clock: scene.clock,
    }),
    /** The map: whether it is open, and as last drawn its frame and how many things stand on it; \`null\` before it first opens. */
    map: () => {
      const last = scene.map.last;
      return {
        open: scene.map.open,
        drawn: last
          ? {
              centre: last.frame.centre,
              middle: last.frame.middle,
              scale: last.frame.scale,
              things: last.things,
              flowers: last.flowers,
              child: last.child,
              ahead: last.ahead,
            }
          : null,
      };
    },
    controls: () => ({
      plus: centre(scene.layout.plus),
      minus: centre(scene.layout.minus),
      map: centre(scene.layout.map),
      picker: scene.layout.picker.map(centre),
      house: centre(scene.layout.house),
      housePicker: scene.layout.housePicker.map(centre),
      releases: {
        butterfly: centre(scene.layout.releases.butterfly),
        fly: centre(scene.layout.releases.fly),
        bee: centre(scene.layout.releases.bee),
      },
    }),
    /** The meadow's insects, oldest first, each with its current leg and whether the crop shows it. */
    insects: () =>
      scene.meadow.insects.map(({ id, kind, legs, leg }) => {
        const shown = scene.insects.shown.get(id);
        return {
          id,
          kind,
          legs,
          ...leg,
          inSight:
            shown !== undefined &&
            shown.container.visible &&
            shows(shown.container.x),
        };
      }),
    /**
     * An insect on screen: where it is drawn, where its flight had it and
     * its perch stood last frame, both in its leg's frame (world px at the
     * opening eye), and when it was last tapped; \`null\` once it is gone.
     */
    insect: (id) => {
      const shown = scene.insects.shown.get(id);
      if (!shown) return null;
      return {
        ...toScreen(shown.container),
        at: { x: shown.at.x, y: shown.at.y },
        end: shown.end ? { x: shown.end.x, y: shown.end.y } : null,
        span: shown.span * shown.container.scaleX,
        tappedAt: finite(shown.tappedAt),
      };
    },
    /** Where each insect was last drawn on the plane, by id (\`drawnAlofts\`); none for one still flying in. */
    drawnAt: () => Object.fromEntries(scene.insects.drawnAlofts()),
    /**
     * Where the perch each insect is bound for stands on the plane, by id, as
     * the perches were last seen; none for one bound away or for a perch no
     * longer placed. The key is \`perchName\`'s.
     */
    boundAt: () =>
      Object.fromEntries(
        scene.meadow.insects.flatMap(({ id, leg: { to } }) => {
          const at = to.kind === 'away' ? undefined : scene.perches.placed.get(to.kind + ' ' + to.id);
          return at ? [[id, at]] : [];
        }),
      ),
    /** The middle of a mushroom's cap as its hit area has it, on screen, whatever stands over it. */
    capMiddle: (id) => {
      const shown = scene.bed.shown.get(id);
      return onScreen(shown.graphics, shown.hit.cap);
    },
    /** A mushroom's box on screen round its cap, gills and stem as its hit area has them. */
    bounds: (id) => {
      const { graphics, hit } = scene.bed.shown.get(id);
      const matrix = graphics.getWorldTransformMatrix();
      const points = [...hit.cap, ...hit.gills, ...hit.stem].map(({ x, y }) =>
        toScreen(matrix.transformPoint(x, y, {})),
      );
      const xs = points.map(({ x }) => x);
      const ys = points.map(({ y }) => y);
      const [x, y] = [Math.min(...xs), Math.min(...ys)];
      return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
    },
    /**
     * Where a tap selects a mushroom, as near its cap's middle as its cap
     * shows (\`reaching\`). With \`through\` set, where no tap reaches the
     * cap itself, where one reaches an insect perched on it, which passes
     * the tap on to the cap (\`tapInsect\`): a butterfly can cover a small
     * cap whole.
     */
    mushroom: (id, through = false) => {
      const shown = scene.bed.shown.get(id);
      const own = reaching(shown.graphics, shown.hit.cap, ['mushroom:' + id]);
      if (own !== null || !through) return own;
      const perched = scene.meadow.insects
        .filter(({ leg }) => leg.to.kind === 'cap' && leg.to.id === id)
        .map((insect) => 'insect:' + insect.id);
      return reaching(shown.graphics, shown.hit.cap, perched);
    },
    /** The middle of a mushroom's door as its hit area has it, on screen: \`null\` with no door painted. */
    door: (id) => {
      const { house } = scene.bed.shown.get(id);
      return house.hit.length === 0 ? null : onScreen(house.graphics, house.hit);
    },
    topAt,
    /** A mushroom's depth: the higher, the nearer the front. */
    depth: (id) => scene.bed.shown.get(id).graphics.depth,
    /** A mushroom's height scale and its house's, \`null\` once it has sunk away. */
    pose: (id) => {
      const shown = scene.bed.shown.get(id);
      if (!shown) return null;
      return {
        mushroom: shown.graphics.scaleY,
        house: shown.house.graphics.scaleY,
        shown: shown.house.graphics.visible,
      };
    },
    /** A mushroom's windows' middles and reaches on screen, and of the taps on a grid over its cap's box finding it or a window, the share finding it. */
    windows: (id) => {
      const { graphics, hit, house } = scene.bed.shown.get(id);
      const [xs, ys] = ['x', 'y'].map((axis) => hit.cap.map((point) => point[axis]));
      const along = (all, k) => Math.min(...all) + ((Math.max(...all) - Math.min(...all)) * k) / 23;
      const tops = [...Array(576).keys()].map((i) =>
        topAt(onScreen(graphics, [{ x: along(xs, i % 24), y: along(ys, Math.floor(i / 24)) }])) ?? '');
      const own = tops.filter((top) => top === 'mushroom:' + id).length;
      const taken = tops.filter((top) => top.startsWith('window:' + id + ':')).length;
      const matrix = house.graphics.getWorldTransformMatrix();
      const reaches = house.reaches.map(({ x, y, r }) =>
        ({ ...toScreen(matrix.transformPoint(x, y, {})), r: r * house.graphics.scaleX }));
      return { reaches, capLeft: own / Math.max(1, own + taken) };
    },
    /** A mushroom's worm: its trip, its phase, and its head and girth as painted, on screen. */
    worm: (id) => {
      const { worm, graphics } = scene.bed.shown.get(id).house;
      const { trip, trips, painted } = worm;
      const head = painted?.head && graphics.getWorldTransformMatrix().transformPoint(painted.head.x, painted.head.y, {});
      return {
        tappedAt: trip?.tappedAt ?? null, from: trip?.source ?? null, to: trip?.target ?? null,
        trips, phase: worm.at(scene.clock)?.phase ?? null, head: head ? toScreen(head) : null,
        girth: painted ? painted.girth * graphics.scaleX : null,
      };
    },
    /** A mushroom's mouse: when a tap on its door called it, how far out it is, and how far across its head and its door are drawn. */
    mouse: (id) => {
      const { house, door, size } = scene.bed.shown.get(id);
      return {
        tappedAt: finite(house.mouse.tappedAt),
        out: house.out(scene.clock),
        head: house.drawnHead,
        door: house.doored && door ? door.width * size * house.graphics.scaleX : 0,
      };
    },
    /** Each run under way: its doors, seconds since it began, and its runner's foot on screen, depth and drawn width (\`spanAcross\`, \`null\` while hidden). */
    runs: () =>
      scene.bed.runs.runs().map(({ from, to, beganAt, graphics }) => ({
        from,
        to,
        elapsed: scene.clock - beganAt,
        shown: graphics.visible,
        ...toScreen(graphics),
        depth: graphics.depth,
        width: graphics.visible ? spanAcross(graphics) : null,
      })),
    /** How many mice each doored house holds. */
    mice: () => Object.fromEntries(scene.bed.runs.mice()),
    /** The nearest shown flower whose head is on screen, the one least likely to be covered. */
    flower: () => {
      const shown = [...scene.flowers.shown.entries()]
        .filter(([, flower]) => flower.container.visible)
        .map(([id, flower]) => {
          const at = flower.head.getWorldTransformMatrix();
          return { id, depth: flower.container.depth, x: at.tx, y: at.ty };
        })
        .filter(({ x, y }) => {
          const head = toScreen({ x, y });
          return head.x >= 0 && head.x <= scene.layout.width && head.y >= 0 && head.y <= scene.layout.height;
        })
        .sort((a, b) => b.depth - a.depth)[0];
      if (!shown) return null;
      const { id, x, y } = shown;
      return { id, ...toScreen({ x, y }) };
    },
    /** When a flower was last tapped, \`null\` if never: JSON has no -Infinity. */
    flowerTappedAt: (id) => {
      const { tappedAt } = scene.flowers.shown.get(id);
      return Number.isFinite(tappedAt) ? tappedAt : null;
    },
    /**
     * The shower as the sky shows it: the meadow's span, whether it rains,
     * how wet the sky is, how strongly the rainbow shows, the drops in the
     * air, how far shut the flowers' heads were painted on average, as the
     * paint reports it (0 while the flower bed reports none), the cloud
     * tapped last, the fliers sitting under a cap now, and the seats under
     * the caps the perches were last seen with.
     */
    rain: () => {
      const span = scene.meadow.rain;
      const now = scene.clock * 1000;
      return {
        span: span ? { startedAt: span.startedAt, stopsAt: span.stopsAt } : null,
        ...scene.rain.shown,
        drops: scene.rain.dropsInAir(),
        closing: scene.flowers.closing(),
        tapped: scene.rain.tapped ?? null,
        fliers: scene.meadow.insects.length,
        sheltering: scene.meadow.insects.filter(
          ({ leg }) => leg.to.kind === 'shelter' && leg.arrives <= now,
        ).length,
        shelters: scene.perches.sight.shelters?.length ?? 0,
      };
    },
    /**
     * The spores and sprouts as the bed draws them. Each spore's parent,
     * whether its dot is drawn, where a tap on the screen reaches it (\`null\`
     * while it is not drawn or something over it takes the tap), and how far
     * it lies from its parent. Each sprout's parent, whether it is of the
     * parent's species, when its clock started, whether it is drawn, how big
     * of its full size (its zoom taken out, its breath left in), and how far
     * it stands from its parent. Whether the flower picker is open. Apart is
     * on the screen, in the clump's size at the parent's zoom.
     */
    sprouts: () => {
      const { mushrooms } = scene.meadow;
      const unit = scene.layout.camera.unit;
      const apart = (stands, parent) => {
        const from = scene.bed.shown.get(parent)?.stands;
        return from ? Math.hypot(stands.x - from.x, stands.y - from.y) / (unit * from.zoom) : null;
      };
      // The bed's dots, a private field: a rename breaks this at play time.
      const dots = scene.bed.spores.dots;
      return {
        planting: scene.meadow.planting !== undefined,
        spores: scene.meadow.spores.map(({ id, parent }) => {
          const dot = dots.get(id);
          const shown = dot !== undefined && dot.circle.visible;
          const point = shown ? toScreen({ x: dot.circle.x, y: dot.circle.y }) : null;
          return {
            id,
            parent,
            shown,
            at: point && topAt(point) === null ? point : null,
            apart: dot ? apart(dot.stands, parent) : null,
          };
        }),
        sprouts: mushrooms
          .filter(({ sprout }) => sprout)
          .map(({ id, species, sprout }) => {
            const { graphics, stands } = scene.bed.shown.get(id);
            const parent = mushrooms.find((one) => one.id === sprout.parent);
            return {
              id,
              parent: sprout.parent,
              ofParent: parent?.species === species,
              at: sprout.at,
              shown: graphics.visible,
              scale: graphics.scaleY / stands.zoom,
              apart: apart(stands, sprout.parent),
            };
          }),
      };
    },
    /**
     * Where a tap reaches each cloud on the screen now, in CSS px: its
     * middle, brought onto the screen while its puffs still reach there;
     * \`null\` while it is off the screen or something over it takes the tap.
     */
    clouds: () =>
      scene.rain.placed().map((cloud) => {
        if (!cloud) return null;
        const x = Math.min(Math.max(cloud.x, 1), scene.layout.width - 1);
        if (Math.abs(x - cloud.x) > cloud.r * ${String(PUFF_REACH.across)}) return null;
        const point = { x, y: cloud.y };
        return topAt(point) === null ? point : null;
      }),
    /** When \`−\` last shook its head, \`null\` if never. */
    minusRefusedAt: () => finite(scene.controls.minus.refusedAt),
    /** When the house, or the house picker's \`index\`th button, last shook its head. */
    houseRefusedAt: () => finite(scene.controls.house.refusedAt),
    furnishRefusedAt: (index) =>
      finite(scene.controls.housePicker.buttons[index].refusedAt),
  };
})()`;

export const State = z.object({
  picking: z.boolean(),
  furnishing: z.boolean(),
  /** One per mushroom, in the meadow's order. */
  houses: z.array(
    z.object({ windows: z.array(z.string()), door: z.boolean() }),
  ),
  selected: z.string().nullable(),
  mushrooms: z.array(z.string()),
  /** Each mushroom's species, in the meadow's order. */
  species: z.array(z.enum(MUSHROOM_SPECIES)),
  mapOpen: z.boolean(),
  clock: z.number(),
});
export const Point = z.object({ x: z.number(), y: z.number() });
/** A flower by its id, at a point. */
export const FlowerAt = Point.extend({ id: z.string() });
/** `__probe.map()`: as last drawn, the map's centre (plane, clump sizes), middle and scale (CSS px, a clump size), and where its flowers, the child and his heading show (CSS px). */
export const MapShown = z.object({
  open: z.boolean(),
  drawn: z
    .object({
      centre: Point,
      middle: Point,
      scale: z.number(),
      things: z.number(),
      flowers: z.array(FlowerAt),
      child: Point,
      ahead: Point,
    })
    .nullable(),
});
/** `__probe.scene.layout.camera`, parsing to the model's camera. */
export const Camera = z.object({
  width: z.number(),
  height: z.number(),
  groundTop: z.number(),
  ground: z.number(),
  world: z.number(),
  midline: z.number(),
  unit: z.number(),
}) satisfies z.ZodType<ModelCamera>;
/** A box on screen, in CSS px. */
export const Box = Point.extend({ width: z.number(), height: z.number() });
/** One schema per kind of perch, each parsing to the model's perch of that kind. */
const PERCHES = {
  flower: z.object({ kind: z.literal('flower'), id: z.string() }),
  cap: z.object({ kind: z.literal('cap'), id: z.string() }),
  air: z.object({ kind: z.literal('air'), id: z.string() }),
  shelter: z.object({
    kind: z.literal('shelter'),
    id: z.string(),
    seat: z.literal(SHELTER_SEATS),
  }),
  away: z.object({ kind: z.literal('away'), side: z.enum(SIDES) }),
} satisfies {
  [Kind in PerchKind]: z.ZodType<Extract<ModelPerch, { kind: Kind }>>;
};
const Perch = z.discriminatedUnion('kind', [
  PERCHES.flower,
  PERCHES.cap,
  PERCHES.air,
  PERCHES.shelter,
  PERCHES.away,
]);
export const Insects = z.array(
  z.object({
    id: z.string(),
    kind: z.enum(INSECT_KINDS),
    legs: z.number(),
    from: Perch,
    to: Perch,
    departs: z.number(),
    arrives: z.number(),
    leaves: z.number(),
    /** Whether the crop shows it, where a finger can reach it. */
    inSight: z.boolean(),
  }),
);
export const ShownInsect = Point.extend({
  at: Point,
  end: Point.nullable(),
  /** How far its open wings span as drawn this frame, in CSS px. */
  span: z.number(),
  tappedAt: z.number().nullable(),
}).nullable();
/** `__probe.drawnAt()` and `__probe.boundAt()`: a plane point per insect, in the clump's size, by id. */
export const InsectPoints = z.record(z.string(), Point);
export const Controls = z.object({
  plus: Point,
  minus: Point,
  map: Point,
  picker: z.array(Point),
  house: Point,
  housePicker: z.array(Point),
  releases: z.record(z.enum(INSECT_KINDS), Point),
});
/** `__probe.eye()`: the eye on the plane, in the clump's size, its heading in radians, and the screen in CSS px. */
export const Eye = z.object({
  x: z.number(),
  y: z.number(),
  heading: z.number(),
  walked: z.number(),
  /** The camera's scroll down the screen, in CSS px: the walk's bob, never above 0. */
  bob: z.number(),
  /** Footsteps sounded since the probe went in. */
  steps: z.number(),
  width: z.number(),
  height: z.number(),
  unit: z.number(),
});
/** `__probe.sun()`: the sun's middle across the screen, `null` while the view leaves it out. */
export const Sun = z.number().nullable();
/** `__probe.hitches()`: how long each lawn-tending call and each perch re-sight since the last call took, in ms. */
export const Hitches = z.object({
  tend: z.array(z.number()),
  see: z.array(z.number()),
});
/** `__probe.tendFrames()`: each frame since the last call whose update ran a lawn-tending call, its update ms and the tending calls' share. */
export const TendFrames = z.array(
  z.object({ ms: z.number(), tend: z.number() }),
);
/** `__probe.windows(id)`, its reaches in CSS px. */
export const Windows = z.object({
  reaches: z.array(Point.extend({ r: z.number() })),
  capLeft: z.number(),
});
const Maybe = z.number().nullable();
/** `__probe.worm(id)`, its girth in CSS px as painted at the last frame. */
export const Worm = z.object({
  tappedAt: Maybe,
  from: Maybe,
  to: Maybe,
  trips: z.number(),
  phase: z.enum(['out', 'crawl', 'in', 'peek']).nullable(),
  head: Point.nullable(),
  girth: Maybe,
});
export const Mouse = z.object({
  tappedAt: z.number().nullable(),
  out: z.number(),
  /** In CSS px, as painted at the last frame: 0 with no door. */
  head: z.number(),
  door: z.number(),
});
export const Runs = z.array(
  Point.extend({
    from: z.string(),
    to: z.string(),
    elapsed: z.number(),
    shown: z.boolean(),
    depth: z.number(),
    width: z.number().nullable(),
  }),
);
export const Mice = z.record(z.string(), z.number());
export const Top = z.string().nullable();
export const Pose = z
  .object({ mushroom: z.number(), house: z.number(), shown: z.boolean() })
  .nullable();
export const Flower = FlowerAt.nullable();
export const Shower = z.object({
  span: z.object({ startedAt: z.number(), stopsAt: z.number() }).nullable(),
  raining: z.boolean(),
  wetness: z.number(),
  rainbow: z.number(),
  drops: z.number(),
  closing: z.number(),
  tapped: z.number().nullable(),
  /** Fliers on the meadow, and those seated under a cap. */
  fliers: z.number(),
  sheltering: z.number(),
  /** Seats under the caps in reach, two a cap wide enough. */
  shelters: z.number(),
});
const Clouds = z.array(Point.nullable());
export const Sprouts = z.object({
  /** Whether the flower picker is open. */
  planting: z.boolean(),
  spores: z.array(
    z.object({
      id: z.string(),
      parent: z.string(),
      shown: z.boolean(),
      at: Point.nullable(),
      apart: z.number().nullable(),
    }),
  ),
  sprouts: z.array(
    z.object({
      id: z.string(),
      parent: z.string(),
      ofParent: z.boolean(),
      at: z.number(),
      shown: z.boolean(),
      scale: z.number(),
      apart: z.number().nullable(),
    }),
  ),
});

/** The arrow keys, by their DOM `key`, and the key code each goes down with. */
const ARROWS = {
  ArrowLeft: 37,
  ArrowUp: 38,
  ArrowRight: 39,
  ArrowDown: 40,
} as const;
export type Arrow = keyof typeof ARROWS;

/**
 * The letter keys a play presses, by their DOM `code`, and the key code each
 * goes down with: `l` the note G, `h` D, `k` F, `o` F♯, `p` G♯, `y` C♯.
 */
const LETTERS = {
  KeyL: 76,
  KeyH: 72,
  KeyK: 75,
  KeyO: 79,
  KeyP: 80,
  KeyY: 89,
} as const;
export type Letter = keyof typeof LETTERS;

/** The strafing keys a play holds, by their DOM `code`: `c` rightward. */
const STRAFES = { KeyC: 67 } as const;
export type Strafe = keyof typeof STRAFES;

/** Every key a play presses, and the key code it goes down with. */
export const KEY_CODES = { ...ARROWS, ...LETTERS, ...STRAFES } as const;

/** A stepped frame's game time, in ms. */
export const FRAME_MS = 1000 / 60;

/** The page `play-mushrooms.ts` drives, a frame and a tap at a time. */
export type Page = {
  evaluate: <Parsed>(
    expression: string,
    schema: z.ZodType<Parsed>,
  ) => Promise<Parsed>;
  step: (frames: number) => Promise<void>;
  /**
   * `frames` frames stepped and none drawn, `expression` read after each and
   * parsed by `schema`: how something moves frame by frame.
   */
  trace: <Parsed>(
    frames: number,
    expression: string,
    schema: z.ZodType<Parsed>,
  ) => Promise<Parsed[]>;
  /** The JS time of every frame `step` has drawn, in ms. */
  rendered: readonly number[];
  tap: (point: z.infer<typeof Point>) => Promise<void>;
  /**
   * One finger pressed at `from`, moved to `to` over `frames` frames, one
   * move a frame, and lifted: a pan, or a tap where it moves less than the
   * slop. Every touch carries the frames' clock, as a real finger's does.
   */
  drag: (
    from: z.infer<typeof Point>,
    to: z.infer<typeof Point>,
    frames: number,
  ) => Promise<void>;
  /**
   * `drag`, with `expression` read after each move and parsed by `schema`:
   * what the finger moved, move by move, up to its lift.
   */
  dragTraced: <Parsed>(
    from: z.infer<typeof Point>,
    to: z.infer<typeof Point>,
    frames: number,
    expression: string,
    schema: z.ZodType<Parsed>,
  ) => Promise<Parsed[]>;
  /**
   * A key going down or up, by its DOM `code`, as `ArrowLeft`; a `repeat` is
   * the browser's own repeat of a held key's press.
   */
  key: (
    key: Arrow | Letter | Strafe,
    type: 'keyDown' | 'keyUp',
    held?: { repeat?: boolean },
  ) => Promise<void>;
  /** The screen turned: its width and height swapped. */
  turn: () => Promise<void>;
  /** A frame of the whole screen, or of `clip` alone. */
  shoot: (step: string, clip?: z.infer<typeof Box>) => Promise<void>;
};

export type Expect = (holds: boolean, message: string) => void;

/**
 * The eye turned and walked in, as a child looks round before tapping: `→`
 * held ¾ s, the meadow sliding across the screen, then `↑` held ½ s, each
 * let go and left to come to rest. Returns a line saying how far it turned
 * and walked.
 */
export async function walkAndTurn(page: Page): Promise<string> {
  const eye = async () => page.evaluate('__probe.eye()', Eye);
  const holdFor = async (key: Arrow, frames: number) => {
    await page.key(key, 'keyDown');
    await page.step(frames);
    await page.key(key, 'keyUp');
    await page.step(150);
  };
  const from = await eye();
  await holdFor('ArrowRight', 45);
  await holdFor('ArrowUp', 30);
  const to = await eye();
  return `the eye turned ${wrap(to.heading - from.heading).toFixed(3)} rad and walked ${(to.walked - from.walked).toFixed(2)} units`;
}

/** A mushroom grown as a child grows one: `+` tapped, then `cap` of the picker, each left to settle. */
export async function grow(
  page: Page,
  controls: z.infer<typeof Controls>,
  cap: z.infer<typeof Point> | undefined,
): Promise<void> {
  await page.tap(controls.plus);
  await page.step(30);
  if (cap) await page.tap(cap);
  await page.step(90);
}

/** `ids`, the mushrooms', from the one drawn furthest back to the one in front. */
export async function backToFront(
  page: Page,
  ids: readonly string[],
): Promise<string[]> {
  const depths = await Promise.all(
    ids.map(async (id) => ({
      id,
      depth: await page.evaluate(
        `__probe.depth(${JSON.stringify(id)})`,
        z.number(),
      ),
    })),
  );
  return depths.toSorted((a, b) => a.depth - b.depth).map(({ id }) => id);
}

/** Where `Page.drag`'s finger stands after each of its `frames` moves from `from` to `to`. */
export function dragMoves(
  from: z.infer<typeof Point>,
  to: z.infer<typeof Point>,
  frames: number,
): Array<z.infer<typeof Point>> {
  return Array.from({ length: frames }, (_, index) => {
    const along = (index + 1) / frames;
    return {
      x: from.x + (to.x - from.x) * along,
      y: from.y + (to.y - from.y) * along,
    };
  });
}

/** Runs `each` over `items` one after another, as taps on one page must. */
export async function inTurn<Item>(
  items: readonly Item[],
  each: (item: Item) => Promise<void>,
): Promise<void> {
  const [first, ...rest] = items;
  if (first === undefined) return;
  await each(first);
  return inTurn(rest, each);
}

/** `frames` frames stepped one by one, each drawn; returns each one's update in ms. */
export async function timedSteps(
  page: Page,
  frames: number,
): Promise<number[]> {
  const from = page.rendered.length;
  await inTurn(
    Array.from({ length: frames }, (_, index) => index),
    async () => page.step(1),
  );
  return page.rendered.slice(from);
}

/** Taps the first cloud a tap reaches on the screen and returns where; `undefined`, the miss expected, where none is. */
export async function tapCloud(
  page: Page,
  expect: Expect,
): Promise<z.infer<typeof Point> | undefined> {
  const cloud = (await page.evaluate('__probe.clouds()', Clouds)).find(
    (point) => point !== null,
  );
  expect(cloud !== undefined, 'no cloud a tap reaches on the screen');
  if (cloud) await page.tap(cloud);
  return cloud;
}

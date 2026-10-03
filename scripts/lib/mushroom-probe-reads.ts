import { PUFF_REACH } from '../../src/pages/mushrooms/ui/scene/cloud-puffs.ts';

/**
 * The second half of `PROBE`'s page-side source: the members of
 * `window.__probe`, each reading the scene through `PROBE_INSTRUMENTS`'
 * names, which share its function body.
 */
export const PROBE_READS = `
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
    /** The map: whether it is open, and what it showed last drawn, \`null\` before it first opens. */
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
    /** A mushroom's worm: its trip, its phase, how open its two windows are, and its head and girth as painted, on screen. */
    worm: (id) => {
      const { worm, graphics } = scene.bed.shown.get(id).house;
      const { trip, trips, painted } = worm;
      const head = painted?.head && graphics.getWorldTransformMatrix().transformPoint(painted.head.x, painted.head.y, {});
      return {
        tappedAt: trip?.tappedAt ?? null, from: trip?.source ?? null, to: trip?.target ?? null,
        trips, phase: worm.at(scene.clock)?.phase ?? null, head: head ? toScreen(head) : null,
        girth: painted ? painted.girth * graphics.scaleX : null,
        fromOpen: trip ? worm.window(scene.clock, trip.source).open : 0,
        toOpen: trip?.target === undefined ? 0 : worm.window(scene.clock, trip.target).open,
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
    flowerTappedAt: (id) => finite(scene.flowers.shown.get(id).tappedAt),
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
`;

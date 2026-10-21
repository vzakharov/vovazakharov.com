/**
 * The first half of `PROBE`'s page-side source: the scene, the timers wrapped
 * round its calls, and the helpers `PROBE_READS` reads it through. Spliced
 * into one function body with `PROBE_READS`, so the names it declares are the
 * ones that half uses.
 */
export const PROBE_INSTRUMENTS = `
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
  // Every footstep the walk sounds, counted at the call, before the voice checks it has audio.
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
`;

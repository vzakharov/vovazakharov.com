// The page's state, floor and door placement, tuning, readings and the floor plan.
// One script scope with arm.js and ui.js, loaded in that order after world.js.
const S = window.DoorSim, W = window.DoorWorld;
const $ = (id) => document.getElementById(id);
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const state = { k: 5, perHundred: 100, minGap: 11, doorShare: 75, window: false, floorSeed: 7, doorSeed: 101, pairSeed: 3, heat: true, elig: true, dead: true, game: true, spacing: 'arm', landing: 0, hole: 0, clickNext: 'landing' };
let maze, mazeOpen, placement, adjBare, adjDoors, distLand, seen, eyesBare, eyesDoors, wander;

const canvas = $('floor');
const ctx = canvas.getContext('2d');

// Floors of our world already searched, by k: the brute force runs once each.
const gameFloors = new Map();
const worldHash = W.pathHash(W.WORLD.seed);
// Each floor draws its own pair, so a new floor moves the landing and the hole too.
const pairSeed = () => state.pairSeed * 7919 + state.floorSeed;
let floorToken = 0;
async function rebuildFloor() {
  const token = ++floorToken, k = state.k;
  if (!state.game) {
    maze = S.buildMaze(k, state.floorSeed);
    const [[a, h]] = S.randomPairs(maze, 1, pairSeed());
    state.landing = a; state.hole = h;
    $('gameNote').textContent = '';
    rebuildDoors();
    return;
  }
  const next = S.buildMaze(k, 0, W.blockSource(W.WORLD.seed, k + 1));
  if (!gameFloors.has(k)) {
    const found = await W.gameFloor(k + 1, (p) => {
      if (token === floorToken) $('gameNote').textContent = `ищу приземление и дыру перебором печатей: ${Math.round(p * 100)}%`;
    });
    gameFloors.set(k, found);
  }
  if (token !== floorToken) return;
  maze = next;
  ({ landing: state.landing, hole: state.hole } = gameFloors.get(k));
  const xy = (i) => `(${i % maze.s}, ${Math.floor(i / maze.s)})`;
  $('gameNote').textContent = `этаж ${k + 1} нашего мира: приземление ${xy(state.landing)}, дыра ${xy(state.hole)}, найдены по печатям из world.json. Двери из броска мира: у каждой перегородки свой бросок doorway/${k + 1}/…/has (есть ли дверь) и …/at (на какой стене); в игре их пока нет, это предложение`;
  rebuildDoors();
}
function rebuildDoors() {
  const how = { perHundred: state.perHundred, minGap: state.minGap, doorShare: state.doorShare / 100, spacing: state.spacing, roll: doorRoll() };
  placement = S.placeDoors(maze, { ...how, window: state.window });
  if (state.window) {
    // The full count beside it, so the page shows the two agree rather than saying so.
    const full = S.placeDoors(maze, how), same = (a, b) => a.length === b.length && a.every((w, i) => w === b[i]);
    const agree = same(placement.doors, full.doors) && same(placement.gaps, full.gaps) && placement.eligible === full.eligible;
    $('windowOut').innerHTML = `Поиском проверено <b>${placement.searched}</b> стен из ${maze.closed.length}, остальные ${maze.closed.length - placement.searched} решены оценкой. Разрешённых ${placement.eligible}, полный подсчёт по всему дереву даёт ${full.eligible}. ${agree ? '<span style="color:var(--allow)">Двери и проёмы стоят на тех же стенах, что и при полном подсчёте.</span>' : '<span style="color:var(--door)">Расстановка разошлась с полным подсчётом!</span>'}`;
  } else $('windowOut').textContent = '';
  placement.redundant = S.redundant(maze, placement.doors.concat(placement.gaps), state.minGap);
  mazeOpen = S.withGaps(maze, placement.gaps);
  adjBare = S.adjacency(maze, []);
  adjDoors = S.adjacency(mazeOpen, placement.doors);
  eyesBare = S.eyesOf(maze, []);
  eyesDoors = S.eyesOf(mazeOpen, placement.doors);
  wander = hourOfWandering();
  $('tuneNote').textContent = '';
  refresh();
}
// An hour's walk at step.ts's WALK_SPEED, in room sides a second, from random rooms: a random
// wanderer and an explorer who remembers every room bracket a real player from below and above.
const HOUR_STEPS = Math.round(3600 * 0.28), WANDER_RUNS = 30;
// The hour averaged over `runs` walks from rooms drawn the same way every call, so two settings
// differ only by their openings.
function hourOf(adj, p, who, runs) {
  const rnd = S.mulberry32(4243 + state.k), t = { doors: 0, gaps: 0, rooms: 0 };
  for (let r = 0; r < runs; r++) {
    const a = Math.floor(rnd() * maze.N);
    const rooms = who === 'explorer' ? S.exploreWalk(adj, a, HOUR_STEPS) : S.randomWalk(adj, a, HOUR_STEPS, rnd);
    const d = S.metAlong(rooms, p.doors);
    t.doors += d.met / runs; t.rooms += d.rooms / runs;
    t.gaps += S.metAlong(rooms, p.gaps).met / runs;
  }
  return t;
}
function hourOfWandering() {
  return { explorer: hourOf(adjDoors, placement, 'explorer', WANDER_RUNS), wanderer: hourOf(adjDoors, placement, 'wanderer', WANDER_RUNS) };
}
function doorRoll() {
  return state.game ? ((H, n) => (path) => H(`doorway/${n}/${path}`))(worldHash, state.k + 1) : S.seededRoll(`sandbox/${state.doorSeed}`);
}
// The explorer's hour against the target: the share is the target's own ratio, then the highest
// threshold whose fullest density still reaches the target total, then the density nearest to it.
// A higher threshold leaves fewer, longer shortcuts, so it is the one worth keeping.
const TUNE_RUNS = WANDER_RUNS;
let tuning = false;
async function tune() {
  if (tuning) return;
  const wantDoors = Math.max(0, +$('wantDoors').value || 0), wantGaps = Math.max(0, +$('wantGaps').value || 0), want = wantDoors + wantGaps;
  if (!want) { $('tuneNote').textContent = 'цель пустая — подбирать нечего'; return; }
  tuning = true; $('tune').disabled = true;
  const roll = doorRoll(), doorShare = wantDoors / want;
  const met = (minGap, perHundred) => {
    const p = S.placeDoors(maze, { perHundred, minGap, doorShare, spacing: state.spacing, roll });
    const t = hourOf(S.adjacency(S.withGaps(maze, p.gaps), p.doors), p, 'explorer', TUNE_RUNS);
    return t.doors + t.gaps;
  };
  let g = 256, best = null, lastEligible = -1;
  for (; g >= 0; g--) {
    const { eligible } = S.placeDoors(maze, { perHundred: 100, minGap: g, spacing: state.spacing, roll });
    // The allowed walls only grow as the threshold falls, so an unchanged count is an unchanged set.
    if (eligible === lastEligible) continue;
    lastEligible = eligible;
    const top = met(g, 100);
    if (!best || top > best.n) best = { g, per: 100, n: top };
    if (top >= want) break;
    if (g % 4 === 0) { $('tuneNote').textContent = `ищу порог: ${g}, при 100 на 100 комнат исследователь встречает ${Math.round(top)} из ${want}…`; await new Promise((r) => setTimeout(r)); }
  }
  if (best.n >= want) {
    let lo = 0, hi = 100;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; (met(best.g, mid) >= want ? (hi = mid) : (lo = mid)); }
    const [nLo, nHi] = [met(best.g, lo), met(best.g, hi)];
    best = Math.abs(nLo - want) < Math.abs(nHi - want) ? { g: best.g, per: lo, n: nLo } : { g: best.g, per: hi, n: nHi };
  }
  tuning = false; $('tune').disabled = false;
  state.doorShare = Math.round(100 * doorShare); $('share').value = state.doorShare;
  state.minGap = best.g; $('gap').value = best.g;
  state.perHundred = best.per; $('density').value = best.per;
  rebuildDoors();
  const t = wander.explorer;
  $('tuneNote').textContent = best.n >= want - 0.5
    ? `доля дверей ${state.doorShare}%, порог ${best.g} — самый высокий, при котором цель достижима, плотность ${best.per} на 100 комнат: исследователь встречает за час ${Math.round(t.doors)} дверей и ${Math.round(t.gaps)} проёмов`
    : `${want} за час не достать ни при каком пороге: больше всего ${Math.round(best.n)}, порог ${best.g}, плотность 100`;
}
function refresh() {
  distLand = S.bfs(adjDoors, state.landing);
  seen = S.deadEnds(mazeOpen, placement.doors, state.landing, state.hole, eyesDoors);
  $('deadOut').textContent = `не зайдёт в ${seen.skipped.toLocaleString('ru-RU')} из ${maze.N.toLocaleString('ru-RU')} комнат (${Math.round((100 * seen.skipped) / maze.N)}%). Игрок идёт волной от приземления и помнит каждую грань стены, увиденную из середины комнаты и с порога каждого её прохода. Комната — явный тупик, если все её стороны, кроме ведущей к игроку, — стена, про которую видно, что она глухая, или проход в явный тупик. Пока дверей нет, хватает куска стены: сторона либо глухая вся, либо открыта вся. С дверями грань надо увидеть целиком. Комната, где игрок побывал, и комната с дырой тупиком не считаются.`;
  draw();
  readings();
  $('densityOut').textContent = state.perHundred;
  $('gapOut').textContent = state.minGap;
  const p = placement;
  $('shareOut').textContent = `${state.doorShare}%`;
  $('tallyBig').innerHTML = `<span class="d">дверей ${p.doors.length}</span> · <span class="g">проёмов ${p.gaps.length}</span>`;
  const hour = (t) => `<span class="d"><b>${Math.round(t.doors)}</b> дверей</span>, <span class="g"><b>${Math.round(t.gaps)}</b> проёмов</span> на ${Math.round(t.rooms)} комнатах`;
  $('wanderOut').innerHTML = `За час ходьбы: исследователь ${hour(wander.explorer)}; блуждающий наугад ${hour(wander.wanderer)}. <small>Шагом это ${HOUR_STEPS} переходов из комнаты в комнату, сквозь двери и проёмы как сквозь любой проход, дыра не останавливает. Встреча — постоять в одной из двух комнат, которые отверстие соединяет; каждое отверстие считается один раз. Исследователь помнит все комнаты и идёт к ближайшей новой, блуждающий выбирает выход наугад; живой игрок где-то между ними. Кнопка подбирает под исследователя.</small>`;
  drawArm();
  $('placedOut').textContent = `просили ${p.want} · разрешённых стен ${p.eligible} из ${maze.closed.length} · лишних, чей обход с учётом остальных отверстий короче порога: ${p.redundant}`;
}

function pathOf(adj, from, to) {
  const prev = new Int32Array(adj.length).fill(-1), q = [from];
  prev[from] = from;
  for (let h = 0; h < q.length; h++) for (const v of adj[q[h]]) if (prev[v] < 0) { prev[v] = q[h]; q.push(v); }
  const out = [to];
  while (out[out.length - 1] !== from) out.push(prev[out[out.length - 1]]);
  return out.reverse();
}

function draw() {
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth || 560;
  if (canvas.width !== Math.round(W * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(W * dpr); }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const { s } = maze, pad = 6, c = (W - 2 * pad) / s;
  const X = (i) => pad + (i % s) * c, Y = (i) => pad + Math.floor(i / s) * c;
  ctx.clearRect(0, 0, W, W);
  ctx.fillStyle = css('--sheet'); ctx.fillRect(0, 0, W, W);
  if (state.heat) {
    let max = 0; for (const d of distLand) max = Math.max(max, d);
    const rgb = css('--heat');
    for (let i = 0; i < maze.N; i++) {
      ctx.fillStyle = `rgba(${rgb}, ${0.32 * (1 - distLand[i] / max)})`;
      ctx.fillRect(X(i), Y(i), c + 0.5, c + 0.5);
    }
  }
  // Rooms the player never enters, hatched under the walls so the walls stay crisp.
  if (state.dead) {
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < maze.N; i++) if (!seen.entered[i]) ctx.rect(X(i), Y(i), c + 0.5, c + 0.5);
    ctx.clip();
    ctx.fillStyle = css('--dead-fill'); ctx.fillRect(0, 0, W, W);
    ctx.strokeStyle = css('--dead'); ctx.lineWidth = 1;
    ctx.beginPath();
    for (let d = -W; d < W; d += 5) { ctx.moveTo(d, W); ctx.lineTo(d + W, 0); }
    ctx.stroke();
    ctx.restore();
  }
  ctx.strokeStyle = css('--wall'); ctx.lineWidth = Math.max(1, Math.min(2.2, c * 0.12)); ctx.lineCap = 'square';
  ctx.beginPath();
  for (const w of mazeOpen.closed) wallSeg(w, X, Y, c, 1);
  ctx.rect(pad, pad, s * c, s * c);
  ctx.stroke();
  // Allowed walls over the plain ones, so the choice reads at a glance.
  if (state.elig) {
    ctx.strokeStyle = css('--allow'); ctx.lineWidth = Math.max(2.5, Math.min(8, c * 0.24)); ctx.lineCap = 'butt';
    ctx.beginPath();
    for (const w of maze.closed) if (w.exact >= state.minGap) wallSeg(w, X, Y, c, 0.9);
    ctx.stroke();
  }
  // Doors: one bar across the wall, read the same from either room.
  ctx.strokeStyle = css('--door'); ctx.lineWidth = Math.max(2.5, Math.min(10, c * 0.32)); ctx.lineCap = 'butt';
  ctx.beginPath();
  for (const w of placement.doors) wallSeg(w, X, Y, c, 0.62);
  ctx.stroke();
  // Gaps: the missing wall traced faintly, so the plan shows what the player cannot.
  ctx.strokeStyle = css('--gap'); ctx.lineWidth = Math.max(1.5, Math.min(4, c * 0.14)); ctx.setLineDash([Math.max(2, c * 0.12), Math.max(2, c * 0.12)]);
  ctx.beginPath();
  for (const w of placement.gaps) wallSeg(w, X, Y, c, 0.9);
  ctx.stroke(); ctx.setLineDash([]);
  const centre = (i) => [X(i) + c / 2, Y(i) + c / 2];
  const line = (path, colour, width, dash) => {
    ctx.strokeStyle = colour; ctx.lineWidth = width; ctx.setLineDash(dash); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); path.forEach((i, j) => { const [x, y] = centre(i); j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); ctx.setLineDash([]);
  };
  const pathWidth = Math.max(1.5, Math.min(5, c * 0.16));
  line(pathOf(adjBare, state.landing, state.hole), css('--bare'), pathWidth, [Math.max(4, Math.min(12, c * 0.45)), Math.max(3, Math.min(8, c * 0.3))]);
  line(pathOf(adjDoors, state.landing, state.hole), css('--door'), pathWidth, []);
  // Start and goal ringed in the sheet colour, so neither sinks into the heat map.
  const r = Math.max(5, Math.min(14, c * 0.4));
  ctx.lineWidth = 2.5; ctx.strokeStyle = css('--sheet');
  let [x, y] = centre(state.landing);
  ctx.fillStyle = css('--land'); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); ctx.fill();
  [x, y] = centre(state.hole);
  ctx.fillStyle = css('--hole'); ctx.strokeRect(x - r, y - r, 2 * r, 2 * r); ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}

function wallSeg(w, X, Y, c, frac) {
  const i = w.a, inset = (c * (1 - frac)) / 2;
  if (w.dir === 'E') { const x = X(i) + c; ctx.moveTo(x, Y(i) + inset); ctx.lineTo(x, Y(i) + c - inset); }
  else { const y = Y(i) + c; ctx.moveTo(X(i) + inset, y); ctx.lineTo(X(i) + c - inset, y); }
}

function readings() {
  const a = state.landing, h = state.hole;
  const path = [S.bfs(adjBare, a)[h], S.bfs(adjDoors, a)[h]];
  const mapper = [S.mapper(adjBare, a, h), S.mapper(adjDoors, a, h)];
  const mapperSees = [S.mapper(adjBare, a, h, eyesBare.player(h)), S.mapper(adjDoors, a, h, eyesDoors.player(h))];
  const rnd = S.mulberry32(state.pairSeed * 13 + 1), runs = maze.k >= 7 ? 4 : 12, cap = 400 * maze.N;
  const wanderWith = (eyes) => [[adjBare, eyesBare], [adjDoors, eyesDoors]].map(([adj, e]) => { let t = 0; for (let r = 0; r < runs; r++) t += S.wanderer(adj, a, h, rnd, cap, eyes ? e.player(h) : null); return Math.round(t / runs); });
  const wander = wanderWith(false), wanderSees = wanderWith(true);
  const openers = [S.opener(maze, []), S.opener(mazeOpen, placement.doors)];
  const fol = openers.map((o) => S.follower(maze, o, a, h));
  const folSees = openers.map((o, j) => S.follower(maze, o, a, h, (j ? eyesDoors : eyesBare).player(h)));
  const fmt = (n) => n.toLocaleString('ru-RU');
  const row = (name, [x, y]) => `<tr><td>${name}</td><td class="num">${fmt(x)}</td><td class="num">${fmt(y)}${x ? ` <span style="color:var(--ink-soft)">(${(y / x).toFixed(2)})</span>` : ''}</td></tr>`;
  const hand = (name, f) => f[0].ok && f[1].ok
    ? row(name, [f[0].steps, f[1].steps])
    : `<tr><td>${name}</td><td class="num">${f[0].ok ? fmt(f[0].steps) : 'не дошёл'}</td><td class="num">${f[1].ok ? fmt(f[1].steps) : 'кружит, не дошёл'}</td></tr>`;
  const sees = (name) => `<span style="color:var(--ink-soft)">${name}, видя тупики</span>`;
  $('readings').innerHTML =
    row('маршрут, если знаешь где', path) +
    row('картограф, шагов', mapper) + row(sees('картограф'), mapperSees) +
    row(`блуждающий, шагов (среднее из ${runs})`, wander) + row(sees('блуждающий'), wanderSees) +
    hand('правая рука, шагов', fol) + hand(sees('правая рука'), folSees);
}

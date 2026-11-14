// The arm view: one block's cross and the walls of one arm. Shares page.js's scope.
// One block of the floor and one arm of its cross: every wall of the arm sorted by whether the
// 2·d + 1 bound already clears the threshold, or a search had to settle it.
const armView = { level: null, arm: null, pick: null };
const ARM_NAMES = ['северный', 'восточный', 'южный', 'западный'];
function armGeometry() {
  const { s, k } = maze, L = Math.max(1, Math.min(armView.level ?? Math.min(k, 5), k)), half = 1 << (L - 1);
  const lx = state.landing % s, ly = Math.floor(state.landing / s);
  const x0 = (lx >> L) << L, y0 = (ly >> L) << L, b = maze.block(L, x0, y0);
  const arm = armView.arm ?? [0, 1, 2, 3].find((a) => a !== b.omit);
  const blind = b.omit === arm;
  // The end a blind arm's way round has to turn: the arm's offset nearest the cross's centre.
  const anchor = blind ? (arm === 0 || arm === 3 ? half - 1 : 0) : b.door[arm];
  if (!maze.closedAt) maze.closedAt = new Map(maze.closed.map((w) => [`${w.dir}${w.a}`, w]));
  const walls = [];
  for (let o = 0; o < half; o++) {
    const [dir, x, y] = arm === 0 ? ['E', x0 + half - 1, y0 + o] : arm === 2 ? ['E', x0 + half - 1, y0 + half + o] : arm === 3 ? ['S', x0 + o, y0 + half - 1] : ['S', x0 + half + o, y0 + half - 1];
    const a = y * s + x, w = maze.closedAt.get(`${dir}${a}`) || null, d = Math.abs(o - anchor);
    const kind = !w ? 'passage' : 2 * d + 1 >= state.minGap ? 'far' : w.exact >= state.minGap ? 'checked' : 'short';
    walls.push({ o, dir, x, y, a, b: dir === 'E' ? a + 1 : a + s, w, d, kind });
  }
  return { L, half, x0, y0, size: 2 * half, arm, blind, walls };
}
function drawArm() {
  const g = armGeometry(), cv = $('armPlan'), c2 = cv.getContext('2d');
  armView.level = g.L; armView.arm = g.arm;
  $('armLevel').innerHTML = Array.from({ length: maze.k }, (_, i) => i + 1).filter((L) => L >= 2).map((L) => `<button data-l="${L}" aria-pressed="${L === g.L}">${1 << L}×${1 << L}</button>`).join('');
  pressSeg('armWhich', 'a', g.arm);
  $('armGap').value = state.minGap; $('armGapOut').textContent = state.minGap;
  const dpr = window.devicePixelRatio || 1, W = cv.clientWidth || 560;
  if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(W * dpr); }
  c2.setTransform(dpr, 0, 0, dpr, 0, 0);
  const pad = 8, c = (W - 2 * pad) / g.size, s = maze.s;
  const X = (x) => pad + (x - g.x0) * c, Y = (y) => pad + (y - g.y0) * c;
  c2.fillStyle = css('--sheet'); c2.fillRect(0, 0, W, W);
  const seg = (dir, x, y, inset = 0) => dir === 'E'
    ? (c2.moveTo(X(x + 1), Y(y) + inset), c2.lineTo(X(x + 1), Y(y + 1) - inset))
    : (c2.moveTo(X(x) + inset, Y(y + 1)), c2.lineTo(X(x + 1) - inset, Y(y + 1)));
  // The block's own walls, faint, and its outline.
  c2.strokeStyle = css('--rule'); c2.lineWidth = Math.max(1, Math.min(2, c * 0.08)); c2.beginPath();
  for (let y = g.y0; y < g.y0 + g.size; y++) for (let x = g.x0; x < g.x0 + g.size; x++) {
    const i = y * s + x;
    if (x + 1 < g.x0 + g.size && !maze.openE[i]) seg('E', x, y);
    if (y + 1 < g.y0 + g.size && !maze.openS[i]) seg('S', x, y);
  }
  c2.rect(X(g.x0), Y(g.y0), g.size * c, g.size * c); c2.stroke();
  // The cross: the other three arms in wall ink, so the chosen one stands out.
  c2.strokeStyle = css('--wall'); c2.lineWidth = Math.max(1.5, Math.min(3, c * 0.12)); c2.beginPath();
  const h = g.half, cx = g.x0 + h - 1, cy = g.y0 + h - 1;
  for (let o = 0; o < 2 * h; o++) {
    if (maze.closedAt.has(`E${(g.y0 + o) * s + cx}`)) seg('E', cx, g.y0 + o);
    if (maze.closedAt.has(`S${cy * s + g.x0 + o}`)) seg('S', g.x0 + o, cy);
  }
  c2.stroke();
  // The window around the passage (or a blind arm's centre end): the only walls a search may be needed for.
  const win = g.walls.filter((w) => w.kind === 'checked' || w.kind === 'short');
  if (win.length) {
    const lo = win.reduce((a, w) => Math.min(a, w.o), Infinity), hi = win.reduce((a, w) => Math.max(a, w.o), -1);
    const [first, last] = [g.walls[lo], g.walls[hi]];
    c2.strokeStyle = css('--land'); c2.lineWidth = 1.5; c2.setLineDash([4, 3]);
    const m = c * 0.42;
    if (first.dir === 'E') c2.strokeRect(X(first.x + 1) - m, Y(first.y), 2 * m, Y(last.y + 1) - Y(first.y));
    else c2.strokeRect(X(first.x), Y(first.y + 1) - m, X(last.x + 1) - X(first.x), 2 * m);
    c2.setLineDash([]);
  }
  const colour = { far: '--allow', checked: '--land', short: '--ink-soft', passage: '--hole' };
  const width = Math.max(3, Math.min(9, c * 0.3));
  for (const kind of ['far', 'checked', 'short']) {
    c2.strokeStyle = css(colour[kind]); c2.lineWidth = width; c2.lineCap = 'butt'; c2.beginPath();
    for (const w of g.walls) if (w.kind === kind) seg(w.dir, w.x, w.y, c * 0.08);
    c2.stroke();
  }
  // The passage: a mark across the gap, since it has no wall to colour.
  for (const w of g.walls) if (w.kind === 'passage') {
    c2.fillStyle = css('--hole');
    const [px, py] = w.dir === 'E' ? [X(w.x + 1), (Y(w.y) + Y(w.y + 1)) / 2] : [(X(w.x) + X(w.x + 1)) / 2, Y(w.y + 1)];
    c2.beginPath(); c2.arc(px, py, Math.max(4, Math.min(9, c * 0.3)), 0, Math.PI * 2); c2.fill();
  }
  // Where the arm's roll put an opening, if it did.
  const placed = placement.doors.concat(placement.gaps), hit = g.walls.find((w) => w.w && placed.includes(w.w));
  if (hit) { c2.strokeStyle = css('--door'); c2.lineWidth = width * 0.5; c2.beginPath(); seg(hit.dir, hit.x, hit.y, c * 0.3); c2.stroke(); }
  // The chosen wall's way round, room centre to room centre.
  let pick = g.walls.find((w) => w.o === armView.pick && w.w);
  if (!pick) pick = g.walls.filter((w) => w.kind === 'far').sort((u, v) => u.d - v.d)[0] || g.walls.find((w) => w.w);
  if (pick) {
    const path = pathOf(adjBare, pick.a, pick.b);
    c2.strokeStyle = css('--bare'); c2.lineWidth = Math.max(1.5, Math.min(4, c * 0.14)); c2.lineJoin = 'round'; c2.lineCap = 'round';
    c2.beginPath();
    path.forEach((i, j) => { const px = X(i % s) + c / 2, py = Y(Math.floor(i / s)) + c / 2; j ? c2.lineTo(px, py) : c2.moveTo(px, py); });
    c2.stroke();
    c2.strokeStyle = css('--bare'); c2.lineWidth = width * 0.9; c2.beginPath(); seg(pick.dir, pick.x, pick.y, -c * 0.12); c2.globalAlpha = 0.35; c2.stroke(); c2.globalAlpha = 1;
  }
  const n = (kind) => g.walls.filter((w) => w.kind === kind).length;
  const total = g.walls.filter((w) => w.w).length, half = (state.minGap - 1) / 2;
  $('armCount').innerHTML = `${g.blind ? 'Луч глухой' : 'В луче проход'}, стен ${total}. <span style="color:var(--allow)"><b>${n('far')}</b> разрешены заведомо</span>: до ${g.blind ? 'конца в центре' : 'прохода'} от них ${Math.max(0, Math.ceil(half))} стен и больше, и поиск им не нужен. Поиском проверено <b>${n('checked') + n('short')}</b>: <span style="color:var(--land)">${n('checked')} прошли</span>, ${n('short')} нет. На глубоком этаже стен в луче хоть 2<sup>58</sup>, а в окне всё равно не больше ${Math.max(0, state.minGap - 1)}.`;
  $('armPick').innerHTML = pick
    ? `<span style="color:var(--bare)">Обход выбранной стены: <b>${pick.w.exact}</b></span>, а оценка 2·d + 1 = 2·${pick.d} + 1 = <b>${2 * pick.d + 1}</b>: обход не бывает короче оценки, потому что ${g.blind ? 'огибает конец луча в центре' : 'пересекает луч только через проход'}. ${hit ? 'Бросок этого луча выпал на стену, отмеченную красным.' : 'Бросок этого луча отверстия не дал.'}`
    : '';
}
$('armLevel').addEventListener('click', (ev) => { const L = ev.target.dataset?.l; if (!L) return; armView.level = +L; armView.pick = null; drawArm(); });
$('armWhich').addEventListener('click', (ev) => { const a = ev.target.dataset?.a; if (a === undefined) return; armView.arm = +a; armView.pick = null; drawArm(); });
$('armGap').addEventListener('input', (ev) => { state.minGap = +ev.target.value; $('gap').value = state.minGap; rebuildDoors(); });
$('armPlan').addEventListener('click', (ev) => {
  const g = armGeometry(), rect = $('armPlan').getBoundingClientRect(), pad = 8, c = (rect.width - 2 * pad) / g.size;
  const fx = g.x0 + (ev.clientX - rect.left - pad) / c, fy = g.y0 + (ev.clientY - rect.top - pad) / c;
  let best = null, bd = 0.6;
  for (const w of g.walls) {
    if (!w.w) continue;
    const d = w.dir === 'E' ? Math.abs(fx - (w.x + 1)) + Math.abs(fy - (w.y + 0.5)) : Math.abs(fy - (w.y + 1)) + Math.abs(fx - (w.x + 0.5));
    if (d < bd) { bd = d; best = w; }
  }
  if (best) { armView.pick = best.o; drawArm(); }
});

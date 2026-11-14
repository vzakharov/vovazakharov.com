// Floor-plan pointer handling, the controls, the sweep chart and the startup
// calls. Shares page.js's scope and runs last.
function cellAt(ev) {
  const rect = canvas.getBoundingClientRect(), pad = 6, c = (rect.width - 2 * pad) / maze.s;
  const fx = (ev.clientX - rect.left - pad) / c, fy = (ev.clientY - rect.top - pad) / c;
  return { fx, fy, x: Math.floor(fx), y: Math.floor(fy) };
}
canvas.addEventListener('click', (ev) => {
  const { x, y } = cellAt(ev);
  if (x < 0 || y < 0 || x >= maze.s || y >= maze.s) return;
  const i = y * maze.s + x;
  if (state.clickNext === 'landing') { state.landing = i; state.clickNext = 'hole'; }
  else { state.hole = i; state.clickNext = 'landing'; }
  if (state.landing === state.hole) return;
  refresh();
});
canvas.addEventListener('mousemove', (ev) => {
  const { fx, fy } = cellAt(ev);
  let best = null, bd = 0.22;
  for (const w of maze.closed) {
    const d = w.dir === 'E' ? Math.abs(fx - (w.x + 1)) + Math.max(0, Math.abs(fy - (w.y + 0.5)) - 0.5) : Math.abs(fy - (w.y + 1)) + Math.max(0, Math.abs(fx - (w.x + 0.5)) - 0.5);
    if (d < bd) { bd = d; best = w; }
  }
  if (!best) { $('tip').textContent = 'Наведи на стену — покажу, сколько комнат в обход. Клик ставит приземление, следующий клик — дыру.'; return; }
  const isDoor = placement.doors.includes(best), isGap = placement.gaps.includes(best);
  const ok = best.exact >= state.minGap;
  $('tip').textContent = `стена уровня ${best.level}: в обход ${best.exact} шагов. ${isDoor ? 'Здесь дверь.' : isGap ? 'Здесь проём.' : ok ? 'Отверстие можно.' : 'Отверстие нельзя: обход короче порога.'}`;
});

function pressSeg(id, attr, value) { for (const b of $(id).querySelectorAll('button')) b.setAttribute('aria-pressed', String(b.dataset[attr] === String(value))); }
$('size').addEventListener('click', (ev) => { const k = ev.target.dataset?.k; if (!k) return; state.k = +k; pressSeg('size', 'k', k); rebuildFloor(); });
$('density').addEventListener('input', (ev) => { state.perHundred = +ev.target.value; rebuildDoors(); });
$('gap').addEventListener('input', (ev) => { state.minGap = +ev.target.value; rebuildDoors(); });
$('share').addEventListener('input', (ev) => { state.doorShare = +ev.target.value; rebuildDoors(); });
$('window').addEventListener('change', (ev) => { state.window = ev.target.checked; rebuildDoors(); });
$('tune').addEventListener('click', tune);
$('heat').addEventListener('change', (ev) => { state.heat = ev.target.checked; draw(); });
$('elig').addEventListener('change', (ev) => { state.elig = ev.target.checked; draw(); });
$('dead').addEventListener('change', (ev) => { state.dead = ev.target.checked; draw(); });
$('game').addEventListener('click', (ev) => { state.game = !state.game; ev.currentTarget.setAttribute('aria-pressed', String(state.game)); $('newFloor').disabled = $('newDoors').disabled = $('newPair').disabled = state.game; rebuildFloor(); });
$('spacing').addEventListener('click', (ev) => { const sp = ev.target.dataset?.s; if (!sp) return; state.spacing = sp; pressSeg('spacing', 's', sp); rebuildDoors(); });
$('newFloor').addEventListener('click', () => { state.floorSeed++; rebuildFloor(); });
$('newDoors').addEventListener('click', () => { state.doorSeed++; rebuildDoors(); });
$('newPair').addEventListener('click', () => { state.pairSeed++; const [[a, h]] = S.randomPairs(maze, 1, pairSeed()); state.landing = a; state.hole = h; refresh(); });
window.addEventListener('resize', () => { draw(); drawArm(); });
if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { draw(); renderChart(lastSweep); });

// Sweep chart.
const DENSITIES = [0, 1, 2, 3, 5, 8, 12, 20, 30];
const BUDGET = { 1: { floors: 8, pairs: 24 }, 2: { floors: 8, pairs: 24 }, 3: { floors: 8, pairs: 24 }, 4: { floors: 8, pairs: 24 }, 5: { floors: 4, pairs: 20 }, 6: { floors: 2, pairs: 5 }, 7: { floors: 1, pairs: 4 } };
const SERIES = [
  { key: 'mapper', name: 'картограф', colour: '--hole' },
  { key: 'path', name: 'знающий', colour: '--land' },
  { key: 'wander', name: 'блуждающий', colour: '--door' },
];
let lastSweep = null, sweepToken = 0;

async function runSweep() {
  const token = ++sweepToken, { k } = state, { floors, pairs } = BUDGET[k];
  const configs = [{ minGap: state.minGap, spacing: state.spacing }, { minGap: 0, spacing: 'none' }];
  const total = configs.length * DENSITIES.length;
  let done = 0;
  const out = [];
  for (const cfg of configs) {
    const rows = [];
    for (const perHundred of DENSITIES) {
      await new Promise((r) => setTimeout(r, 0));
      if (token !== sweepToken) return;
      const [row] = S.sweep({ k, densities: [perHundred], minGap: cfg.minGap, spacing: cfg.spacing, floors, pairsPerFloor: pairs, seed: 11 });
      rows.push(row);
      $('bar').style.width = `${(++done / total) * 100}%`;
    }
    out.push(rows);
  }
  lastSweep = { k, minGap: state.minGap, rows: out };
  $('sweepNote').textContent = `этаж ${k + 1} (${1 << k}×${1 << k}), порог ${state.minGap}, ${floors} этажа × ${pairs} пар`;
  renderChart(lastSweep);
}

function renderChart(sw) {
  const svg = $('chart');
  if (!sw) return;
  const W = 720, H = 340, L = 48, R = 120, T = 16, B = 40;
  const xMax = DENSITIES[DENSITIES.length - 1];
  const px = (d) => L + (d / xMax) * (W - L - R), py = (v) => T + (1 - Math.min(v, 1.1) / 1.1) * (H - T - B);
  const ink = css('--ink-soft'), rule = css('--rule');
  let g = '';
  for (const v of [0, 0.25, 0.5, 0.75, 1]) g += `<line x1="${L}" x2="${W - R}" y1="${py(v)}" y2="${py(v)}" stroke="${rule}" stroke-width="${v === 1 ? 1.5 : 1}"/><text x="${L - 8}" y="${py(v) + 4}" text-anchor="end" font-size="11" fill="${ink}" font-family="IBM Plex Mono, monospace">${v.toFixed(2)}</text>`;
  for (const d of [0, 5, 10, 15, 20, 25, 30]) g += `<text x="${px(d)}" y="${H - B + 18}" text-anchor="middle" font-size="11" fill="${ink}" font-family="IBM Plex Mono, monospace">${d}</text>`;
  g += `<text x="${(L + W - R) / 2}" y="${H - 6}" text-anchor="middle" font-size="12" fill="${ink}">дверей на 100 комнат</text>`;
  sw.rows.forEach((rows, faint) => {
    for (const sr of SERIES) {
      const colour = css(sr.colour);
      const pts = rows.map((r) => `${px(r.perHundred).toFixed(1)},${py(r[sr.key]).toFixed(1)}`).join(' ');
      g += `<polyline points="${pts}" fill="none" stroke="${colour}" stroke-width="${faint ? 1.5 : 2.5}" stroke-opacity="${faint ? 0.35 : 1}" ${faint ? 'stroke-dasharray="4 4"' : ''}/>`;
      if (!faint) {
        for (const r of rows) g += `<circle cx="${px(r.perHundred)}" cy="${py(r[sr.key])}" r="3" fill="${colour}"><title>${sr.name}: ${r[sr.key].toFixed(2)} при ${r.perHundred} (поставлено ${r.placedPerHundred.toFixed(1)})</title></circle>`;
        const last = rows[rows.length - 1];
        g += `<text x="${W - R + 8}" y="${py(last[sr.key]) + 4}" font-size="12" fill="${colour}" font-weight="600">${sr.name} ${last[sr.key].toFixed(2)}</text>`;
      }
    }
  });
  svg.innerHTML = g;
}

$('runSweep').addEventListener('click', runSweep);
pressSeg('size', 'k', state.k);
pressSeg('spacing', 's', state.spacing); rebuildFloor();
runSweep();

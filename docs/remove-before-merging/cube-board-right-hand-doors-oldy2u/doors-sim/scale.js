const S = require('./sim.js');
// How the effect of 5 doors per 100 rooms (K=8 by the local bound) moves with floor size.
for (const [k, floors, pairs] of [[3, 20, 40], [4, 12, 30], [5, 6, 20], [6, 2, 8]]) {
  const t0 = Date.now();
  const [base, five] = S.sweep({ k, densities: [0, 5], minGap: 8, metric: 'bound', floors, pairsPerFloor: pairs, seed: 5 });
  const capped = 400 * (1 << (2 * k));
  console.log(
    `k=${k} rooms=${1 << (2 * k)}  path ${five.path.toFixed(2)}  mapper ${five.mapper.toFixed(2)}  wander ${five.wander.toFixed(2)}  followFail ${(five.followFail * 100).toFixed(0)}%  placed/100 ${five.placedPerHundred.toFixed(1)}  meanWanderBare ${(base.raw.wander[0] / base.raw.n).toFixed(0)} cap ${capped}  ${Date.now() - t0}ms`,
  );
}

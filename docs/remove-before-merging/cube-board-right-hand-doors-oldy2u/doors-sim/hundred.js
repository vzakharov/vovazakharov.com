const S = require('./sim.js');
for (const minGap of [8, 24, 48])
  for (const spacing of ['none', 'arm']) {
    const [row] = S.sweep({ k: 5, densities: [100], minGap, metric: 'bound', spacing, floors: 8, pairsPerFloor: 24, seed: 11 });
    console.log(minGap, spacing, JSON.stringify(row));
  }

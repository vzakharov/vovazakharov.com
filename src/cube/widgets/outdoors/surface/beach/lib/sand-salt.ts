import { pathHash, roll, rollWith } from '@/dice/shared/roll';

import { wgsl } from '@/cube/shared/shader';

const hash = pathHash('0');

/** What every per-pixel hash of the sand is salted with. */
const { salt: SALT } = rollWith(
  roll.struct({ salt: roll.uniform(0, 2 ** 31) }),
  (path) => hash(`island/sand/${path}`),
);

/** The sand's rolled salt as the WGSL constant `SAND_SALT`. */
export const SAND_SALT = wgsl(
  'sand/sand-salt',
  /* wgsl */ `
const SAND_SALT = ${Math.floor(SALT)}u;
`,
);

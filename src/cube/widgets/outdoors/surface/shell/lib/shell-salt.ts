import { pathHash, roll, rollWith } from '@/dice/shared/roll';

import { wgsl } from '@/cube/shared/shader';

const hash = pathHash('0');

/** What every per-pixel hash of the shell and its ladder is salted with. */
const { salt: SALT } = rollWith(
  roll.struct({ salt: roll.uniform(0, 2 ** 31) }),
  (path) => hash(`cube/shell/${path}`),
);

/** The shell's rolled salt as the WGSL constant `SHELL_SALT`. */
export const SHELL_SALT = wgsl(
  'shell/salt',
  /* wgsl */ `
const SHELL_SALT = ${Math.floor(SALT)}u;
`,
);

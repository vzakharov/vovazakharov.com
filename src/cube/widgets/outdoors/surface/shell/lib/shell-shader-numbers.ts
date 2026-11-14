import { wgsl } from '@/cube/shared/shader';

import { SHELL_KINDS, type ShellKind } from './shell-mesh';

/** The least `kind` a vertex of `kind` and of the kinds after it carries, as WGSL. */
const least = (kind: ShellKind): string =>
  (SHELL_KINDS.indexOf(kind) - 0.5).toFixed(1);

/**
 * Where each kind of the shell's faces starts in a vertex's `kind`, as the
 * WGSL constants `SHELL_<KIND>_FROM`: a vertex of that kind or a later one
 * carries more.
 */
export const SHELL_SHADER_NUMBERS = wgsl(
  'shell/shader-numbers',
  /* wgsl */ `
const SHELL_TOP_FROM = ${least('top')};
const SHELL_UNDERSIDE_FROM = ${least('underside')};
const SHELL_REVEAL_FROM = ${least('reveal')};
const SHELL_STILE_FROM = ${least('stile')};
const SHELL_RUNG_FROM = ${least('rung')};
`,
);

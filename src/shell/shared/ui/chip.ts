import type { LabeledLink } from '@/kernel/shared/typings';

/** One destination in the row; the current one renders inert rather than linked. */
export type Chip = LabeledLink & {
  current: boolean;
  /** The language the chip's destination is in, where the row switches one. */
  hrefLang?: string;
};

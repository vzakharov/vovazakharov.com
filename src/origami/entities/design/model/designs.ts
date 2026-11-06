import { basilisk } from './basilisk.ts';
import type { Design } from './design.ts';

export const DESIGN_IDS = ['basilisk', 'basilisk-needle'] as const;
export type DesignId = (typeof DESIGN_IDS)[number];

/** The models the CLI folds by name. */
export const DESIGNS: Record<DesignId, () => Design> = {
  basilisk: () => basilisk(),
  'basilisk-needle': () => basilisk({ third: true }),
};

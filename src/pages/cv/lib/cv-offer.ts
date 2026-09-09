import type { Messages } from '@/shared/i18n';

import type { CvVariant } from './cv-variants';

type OfferBlocks = Messages['cv']['whatIOffer']['blocks'];

type OfferBlockKey = keyof OfferBlocks;

/** A block states its offer as either a bullet list or prose, never both. */
export type OfferBlock = OfferBlocks[OfferBlockKey];

/**
 * Which blocks each framing offers, and in what order. The head of each list is
 * also the framing's social card, so both lists have to start with a block that
 * bullets its offer rather than one that states it as prose.
 */
export const OFFER_BLOCKS = {
  cto: ['engagements', 'engineeringSystem', 'aiExpertise', 'workingStyle'],
  dev: ['coreCapabilities', 'workingStyle', 'aiExpertise'],
} as const satisfies Record<CvVariant, readonly OfferBlockKey[]>;

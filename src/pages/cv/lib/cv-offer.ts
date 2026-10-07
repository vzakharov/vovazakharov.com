import type { Messages } from '@/shared/i18n';
import type { Labeled } from '@/shared/typings';

import type { CvVariant } from './cv-variants';

type OfferBlocks = Messages['cv']['whatIOffer']['blocks'];

type OfferBlockKey = keyof OfferBlocks;

/** A block states its offer as either a bullet list or prose, never both. */
export type OfferBlock = OfferBlocks[OfferBlockKey];

/**
 * Which blocks each framing offers, and in what order. The head of each list is
 * also the framing's headline — on its social card and on the sheet's intro
 * card — so both lists have to start with a block that bullets its offer rather
 * than one that states it as prose.
 */
export const OFFER_BLOCKS = {
  cto: ['engagements', 'engineeringSystem', 'aiExpertise', 'handsOnLead'],
  dev: ['coreCapabilities', 'workingStyle', 'aiExpertise'],
} as const satisfies Record<CvVariant, readonly OfferBlockKey[]>;

/** The framing whose offer leads with proof keeps the case study one click from the claim. */
export function leadsWithProof(variant: CvVariant): boolean {
  return variant === 'cto';
}

export type OfferHeadline = { offerTitle: string; offer: string[] };

/** The framing's offer in a line per item: a labelled item by its label alone. */
export function offerHeadline(
  { cv }: Messages,
  variant: CvVariant,
): OfferHeadline {
  const { title, blocks } = cv.whatIOffer;
  const [headBlock] = OFFER_BLOCKS[variant];
  const items: ReadonlyArray<string | Labeled> = blocks[headBlock].items;

  return {
    offerTitle: title,
    offer: items.map((item) => (typeof item === 'string' ? item : item.label)),
  };
}

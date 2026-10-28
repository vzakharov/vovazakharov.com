import type { Insect, InsectKind, OfKind } from './insect-genes';
import type { Flight } from './perch';
import type { Carrying } from './pollen-load';

/** A kind that carries no pollen. */
type Visitor = OfKind<Exclude<InsectKind, 'bee'>>;
/** A bee, and the pollen it carries: only a bee has any. */
type Pollinator = OfKind<'bee'> & Carrying;
/**
 * `shied`, the leg, by its count in `legs`, a catch in the air set the flier
 * shying on (`insect-dart.ts`): it darts on that leg alone, so a later leg
 * carrying the count on never darts.
 */
type Shying = { shied?: number };
export type Flier = Insect & Flight & Shying & (Visitor | Pollinator);

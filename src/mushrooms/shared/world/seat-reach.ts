/**
 * A flower's head as whatever sits on it meets it: how far the head reaches,
 * and how wide and how far over the head's middle the sitter sits. The
 * flower judges a seat in sight by this alone; the insect says what it is.
 */

import type { Radiused } from '../lib/geometry';

/** How far a flower's head reaches from its middle, and its centre (`disc`), in CSS px. */
export type HeadReach = Radiused & { disc: number };

/** How far above the middle of a head reaching `reach` its sitter's middle sits, in CSS px. */
export type Lifting = (reach: HeadReach) => number;

/** How wide a thing spans across, in its own unit. */
export type Spanned = { span: number };
/** A sitter on a flower's head: how wide it spans, and where it sits (`Lifting`). */
export type Sitter = Spanned & { lift: Lifting };

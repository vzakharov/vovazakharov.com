/**
 * Where an insect sits on a flower's head, over or under its middle, by its
 * kind: a butterfly drinking from the upper rim, a fly on the centre, a bee
 * crawling on the lower rim.
 */

import { FACE_REACH } from '../../model/bee-outline';
import { CRAWL_REACH } from '../../model/buzz-rest';
import { type FlowerGenes, flowerHead } from '../../model/flower-genes';
import type { Circle } from '../../model/geometry';
import type { InsectKind } from '../../model/insect-genes';
import { BUD, type Folding } from './flower-closing';

/**
 * How far above a flower's centre a drinking butterfly's middle sits, past
 * the centre's own radius, in units of its size: far enough that its tail
 * stays off the centre, so its body rests on the head's upper rim and the
 * proboscis is seen going down into the flower.
 */
const ABOVE_CENTRE = 0.3;

/**
 * How far above a flower's centre a fly sits, in units of its size: on the
 * centre itself, which it has no proboscis to reach from the rim.
 */
const ON_CENTRE = 0.12;

/**
 * How far below the head's lower rim a bee's middle sits, in units of its
 * size: its head and thorax over the petals, facing in toward the centre as
 * a settled insect faces up the screen, and its abdomen over the rim. On a
 * head small beside the bee it sits lower still, its face reaching no
 * farther than the centre (`FACE_REACH`) even at the top of its crawl
 * (`CRAWL_REACH`), so at least half of the head stays in sight under it
 * wherever the crawl takes it.
 */
const PAST_RIM = 0.05;

/** How far a flower's centre reaches from the head's middle, in CSS px. */
export type Centred = { disc: number };

/** How far a flower's head reaches, and its centre (`Centred`). */
export type HeadReach = Pick<Circle, 'r'> & Centred;

/**
 * Where insects perch on the head of a flower `folded` as far shut as that
 * holds, as `paintFlowerHead` draws it: its rim, below the middle, closing up
 * to the bud's foot, and its centre, above it, rising to the bud's tip. Only
 * perching reads it; the head's size, which the ring, the tap and the cull
 * read, stays the open head's (`flowerHead`).
 */
export function foldedHead(
  genes: FlowerGenes,
  size: number,
  { closing }: Folding,
): HeadReach {
  const { r } = flowerHead(genes, size);
  const along = (one: number, other: number) => one + (other - one) * closing;
  return {
    r: along(r, r * BUD.foot),
    disc: along(genes.centre * size, r * BUD.tip),
  };
}

/**
 * How far above the middle of a flower whose head reaches `r` and whose
 * centre reaches `disc` an insect of `kind`, `insectSize` to its unit, sits:
 * a butterfly on the upper rim, drinking down into the centre, a fly on the
 * centre, and a bee on the lower rim, below the middle.
 */
export function flowerLift(
  reach: HeadReach,
  insectSize: number,
  kind: InsectKind = 'butterfly',
): number {
  return flowerLiftAt(reach, insectSize, kind, { host: 1, insect: 1 });
}

/** The zooms a seat on a host is drawn at: the host's own, and the insect's sitting on it. */
export type SeatZooms = Record<'host' | 'insect', number>;

/**
 * `flowerLift` as drawn, when the flower is drawn at `zoom.host` and the
 * insect on it at `zoom.insect`: its head and centre at the flower's zoom,
 * the insect's own offsets at its own, so its legs stay on the head when the
 * two differ.
 */
export function flowerLiftAt(
  { r, disc }: HeadReach,
  insectSize: number,
  kind: InsectKind,
  zoom: SeatZooms,
): number {
  const own = insectSize * zoom.insect;
  switch (kind) {
    case 'butterfly': {
      return disc * zoom.host + ABOVE_CENTRE * own;
    }
    case 'fly': {
      return ON_CENTRE * own;
    }
    case 'bee': {
      return -Math.max(
        r * zoom.host + PAST_RIM * own,
        (FACE_REACH + CRAWL_REACH.y) * own,
      );
    }
    default: {
      return kind satisfies never;
    }
  }
}

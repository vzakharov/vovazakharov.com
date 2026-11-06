/**
 * The sheets a design can be judged against: side and thickness in mm, and how
 * much of each kind of fold the paper keeps once let go.
 */
import { type FoldRecord, isReverse } from './state.ts';

export const PAPER_IDS = [
  'kami-15',
  'copy-a4-square',
  'tissue-foil-35',
] as const;
export type PaperId = (typeof PAPER_IDS)[number];

const FOLD_KINDS = ['flat', 'reverse', 'shaping'] as const;
type FoldKind = (typeof FOLD_KINDS)[number];

export type Paper = {
  readonly side: number;
  readonly thickness: number;
  /** The share of its angle a crease keeps when let go, per kind of fold. A
   * shaping fold's angle is already the one the folder settled on, so it keeps
   * all of it. */
  readonly hold: Readonly<Record<FoldKind, number>>;
};

export const PAPERS: Record<PaperId, Paper> = {
  /** Ordinary origami paper, the default: what "ordinary paper" means here. */
  'kami-15': {
    side: 150,
    thickness: 0.07,
    hold: { flat: 0.96, reverse: 0.98, shaping: 1 },
  },
  /** An A4 copier sheet cut square — 80 g/m², springier than kami. */
  'copy-a4-square': {
    side: 210,
    thickness: 0.1,
    hold: { flat: 0.93, reverse: 0.96, shaping: 1 },
  },
  /** Large and thin, the masters' way past a layer budget; the foil keeps
   * whatever shape it is given. */
  'tissue-foil-35': {
    side: 350,
    thickness: 0.05,
    hold: { flat: 0.99, reverse: 0.995, shaping: 1 },
  },
};

export const DEFAULT_PAPER: PaperId = 'kami-15';

const kind = (record: FoldRecord): FoldKind =>
  !record.flat ? 'shaping' : isReverse(record) ? 'reverse' : 'flat';

/** How much of its angle the fold's crease keeps on this paper. */
export const holdOf = (record: FoldRecord, paper: Paper): number =>
  record.hold ?? paper.hold[kind(record)];

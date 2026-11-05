/** The sheets a design can be judged against: side and thickness in mm. */

export const PAPER_IDS = [
  'kami-15',
  'copy-a4-square',
  'tissue-foil-35',
] as const;
export type PaperId = (typeof PAPER_IDS)[number];

export type Paper = { readonly side: number; readonly thickness: number };

export const PAPERS: Record<PaperId, Paper> = {
  /** Ordinary origami paper, the default: what "ordinary paper" means here. */
  'kami-15': { side: 150, thickness: 0.07 },
  /** An A4 copier sheet cut square — 80 g/m². */
  'copy-a4-square': { side: 210, thickness: 0.1 },
  /** Large and thin, the masters' way past a layer budget. */
  'tissue-foil-35': { side: 350, thickness: 0.05 },
};

export const DEFAULT_PAPER: PaperId = 'kami-15';

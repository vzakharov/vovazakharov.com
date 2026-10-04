/** What a fly's genes and a bee's are drawn alike by: the body, wings and legs they share. */

import type { Buzzing } from './insect-genes';

/** The genes every buzzing insect's ranges name for its body, wings and legs. */
type BuzzingGene =
  | 'bodyLength'
  | 'bodyWidth'
  | 'wingLength'
  | 'wingBreadth'
  | 'wingTip'
  | 'legLength';

/**
 * A buzzing insect's body, wings and legs, drawn from `gene` in this order —
 * the order a seed has always grown them in, so a seed keeps its insect.
 */
export function buzzingBody(
  gene: (name: BuzzingGene) => number,
): Omit<Buzzing, 'kind' | 'hueNudge'> {
  return {
    bodyLength: gene('bodyLength'),
    bodyWidth: gene('bodyWidth'),
    wing: {
      length: gene('wingLength'),
      breadth: gene('wingBreadth'),
      tip: gene('wingTip'),
    },
    legLength: gene('legLength'),
  };
}

'use client';

import { UnstyledButton } from '@mantine/core';

import { cx } from '@/shared/lib/class-names';
import { useScriptPreference } from '@/shared/lib/use-script-preference';
import type { Labeled } from '@/shared/typings';
import { CURRENT_CHIP_CLASS } from '@/shared/ui';

import classes from './music.module.scss';
import { Spelling } from './spelling';

export type ScriptChipProps = Labeled & {
  /** Three letters of the script the page's names are in, from `scriptSample`. */
  sample: string;
  /** What the switch turns on, for a screen reader: the original spelling. */
  original: string;
};

/**
 * The page's language chip as the switch between the two spellings, site-wide:
 * `EN / Abc` in Latin, `EN / Абв` in the original. A checkbox rather than a
 * button, so it shows the spelling in force, not the one a click gives.
 */
export function ScriptChip({ label, sample, original }: ScriptChipProps) {
  const { script, choose } = useScriptPreference();

  return (
    <UnstyledButton
      role="switch"
      aria-checked={script === 'original'}
      aria-label={`${label}: ${original}`}
      className={cx(CURRENT_CHIP_CLASS, classes['scriptChip'])}
      onClick={() => {
        choose(script === 'latin' ? 'original' : 'latin');
      }}
    >
      {label} / <Spelling original={sample} latin="Abc" />
    </UnstyledButton>
  );
}

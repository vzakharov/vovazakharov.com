'use client';

import { UnstyledButton } from '@mantine/core';

import { cx } from '@/kernel/shared/lib/class-names';
import { useScriptPreference } from '@/kernel/shared/lib/use-script-preference';
import type { Labeled } from '@/kernel/shared/typings';

import { CURRENT_CHIP_CLASS } from '@/shell/shared/ui';

import { Spelling } from '@/music/shared/ui';

import classes from './music-nav.module.scss';

export type ScriptChipProps = Labeled & {
  /** Three letters of the script the page's names are in, from `scriptSample`. */
  sample: string;
  /** What a screen reader calls the spelling the switch turns on, in the page's language. */
  originalScript: string;
};

/**
 * The page's language chip as the switch between the two spellings, site-wide:
 * `EN / Abc` in Latin, `EN / Абв` in the original. A checkbox rather than a
 * button, so it shows the spelling in force, not the one a click gives.
 */
export function ScriptChip({ label, sample, originalScript }: ScriptChipProps) {
  const { script, choose } = useScriptPreference();

  return (
    <UnstyledButton
      role="switch"
      aria-checked={script === 'original'}
      aria-label={`${label}: ${originalScript}`}
      className={cx(CURRENT_CHIP_CLASS, classes['scriptChip'])}
      onClick={() => {
        choose(script === 'latin' ? 'original' : 'latin');
      }}
    >
      {label} / <Spelling original={sample} latin="Abc" />
    </UnstyledButton>
  );
}

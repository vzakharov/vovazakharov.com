'use client';

import { UnstyledButton } from '@mantine/core';

import { cx } from '@/shared/lib/class-names';
import { pick } from '@/shared/lib/collections';
import { useScriptPreference } from '@/shared/lib/use-script-preference';
import type { Labeled } from '@/shared/typings';
import { CURRENT_CHIP_CLASS, CurrentChip } from '@/shared/ui';

import classes from './music.module.scss';
import { usePlayer } from './player-provider';
import { Spelling } from './spelling';

export type ScriptChipProps = Labeled & {
  /** Three letters of the script the page's names are in, from `scriptSample`. */
  sample?: string | undefined;
  /** What a screen reader calls the spelling the switch turns on, in the page's language. */
  originalScript: string;
};

/**
 * The page's language chip as the switch between the two spellings, site-wide:
 * `EN / Abc` in Latin, `EN / Абв` in the original. A checkbox rather than a
 * button, so it shows the spelling in force, not the one a click gives. A page
 * with nothing to switch still gets it while the player bar shows a track that
 * has, the bar sitting under every page.
 */
export function ScriptChip({ sample, ...chip }: ScriptChipProps) {
  const { current, locale } = usePlayer();
  const shown = sample ?? current?.samples[locale];

  return shown === undefined ? (
    <CurrentChip {...pick(chip, 'label')} />
  ) : (
    <ScriptSwitch {...chip} sample={shown} />
  );
}

function ScriptSwitch({
  label,
  sample,
  originalScript,
}: ScriptChipProps & { sample: string }) {
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

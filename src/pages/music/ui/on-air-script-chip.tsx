'use client';

import { pick } from '@/shared/lib/collections';
import { CurrentChip } from '@/shared/ui';

import { usePlayer } from './player-provider';
import { ScriptChip, type ScriptChipProps } from './script-chip';
import { useClock } from './use-clock';

export type OnAirScriptChipProps = Omit<ScriptChipProps, 'sample'> & {
  /** Each song the radio may play, by slug, to the sample of its names' script. */
  samples: Record<string, string | undefined>;
};

/**
 * The radio's language chip: the spelling switch while the song on air has
 * names in another script, the plain chip otherwise — and until mount, which
 * is when the clock first says what is on air.
 */
export function OnAirScriptChip({ samples, ...chip }: OnAirScriptChipProps) {
  const { onAir } = usePlayer();
  const now = useClock();
  const slug = now === undefined ? undefined : onAir(now)?.track.slug;
  const sample = slug === undefined ? undefined : samples[slug];

  return sample === undefined ? (
    <CurrentChip {...pick(chip, 'label')} />
  ) : (
    <ScriptChip {...chip} {...{ sample }} />
  );
}

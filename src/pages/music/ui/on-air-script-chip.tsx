'use client';

import { usePlayer } from './player-provider';
import { ScriptChip, type ScriptChipProps } from './script-chip';
import { useClock } from './use-clock';

export type OnAirScriptChipProps = Omit<ScriptChipProps, 'sample'> & {
  /** Each song the radio may play, by slug, to the sample of its names' script. */
  samples: Record<string, string | undefined>;
};

/**
 * The radio's language chip, whose page is the song on air: known only once
 * the clock first ticks after mount.
 */
export function OnAirScriptChip({ samples, ...chip }: OnAirScriptChipProps) {
  const { onAir } = usePlayer();
  const now = useClock();
  const slug = now === undefined ? undefined : onAir(now)?.track.slug;

  return (
    <ScriptChip
      {...chip}
      sample={slug === undefined ? undefined : samples[slug]}
    />
  );
}

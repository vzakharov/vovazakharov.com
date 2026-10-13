'use client';

import { ActionIcon, Popover, Text } from '@mantine/core';
import { Radio } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { DEFAULT_LOCALE } from '@/shared/i18n';
import { cx } from '@/shared/lib/class-names';
import { NameLink } from '@/shared/ui';

import classes from './music.module.scss';
import { usePlayer } from './player-provider';

/** How long the hint stays up after the radio turns on. */
const HINT_MS = 5000;

/**
 * The bar's radio switch: pressed, it releases the radio and the music plays
 * on; unpressed, it tunes in. Each time the radio turns on — from here or from
 * any other button — a hint rises over it, its word “radio” linking to the
 * radio's page from anywhere but that page.
 */
export function RadioToggle() {
  const { state, labels, radioRoute, tuneIn, release } = usePlayer();
  const pathname = usePathname();
  const [hinted, setHinted] = useState(false);
  // Starts off rather than at `state.radio`: the bar mounts with the first
  // track, so a bar mounting on the radio is one the radio just turned on.
  const [wasOn, setWasOn] = useState(false);

  if (state.radio !== wasOn) {
    setWasOn(state.radio);
    setHinted(state.radio);
  }

  useEffect(() => {
    if (!hinted) return;

    const timer = setTimeout(() => {
      setHinted(false);
    }, HINT_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [hinted]);

  const [before, after] = labels.radioHint.split('{radio}');
  // The locale-less alias is the default language's page, so it is spelled
  // with that locale appended before it is compared.
  const onRadioPage = [pathname, `${pathname}/${DEFAULT_LOCALE}`].includes(
    radioRoute,
  );

  return (
    <Popover
      opened={hinted}
      onChange={setHinted}
      position="top"
      width={260}
      shadow="md"
      withArrow
    >
      <Popover.Target>
        <ActionIcon
          variant="default"
          size="lg"
          radius="xl"
          className={cx(state.radio && classes['controlOn'])}
          onClick={state.radio ? release : tuneIn}
          aria-label={labels.radio}
          aria-pressed={state.radio}
        >
          <Radio size={18} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <Text size="sm">
          {before}
          {onRadioPage ? (
            labels.radioHintLink
          ) : (
            <NameLink href={radioRoute}>{labels.radioHintLink}</NameLink>
          )}
          {after}
        </Text>
      </Popover.Dropdown>
    </Popover>
  );
}

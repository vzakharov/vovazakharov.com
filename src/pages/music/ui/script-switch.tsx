'use client';

import { CloseButton, Group, Popover, UnstyledButton } from '@mantine/core';
import { useEffect, useState } from 'react';

import type { Messages } from '@/shared/i18n';
import { useScriptPreference } from '@/shared/lib/use-script-preference';
import type { WithChildren } from '@/shared/typings';

import classes from './music.module.scss';

export type ScriptSwitchProps = WithChildren & {
  tips: Messages['music']['titleScript'];
};

/** How long the tip after a switch stays, unless a tap anywhere closes it first. */
const AFTER_SWITCH_MS = 4000;

/**
 * The song's title as the switch between its two spellings, site-wide.
 *
 * A reader who never chose finds a tip on it saying what a tap does, held
 * until they tap the title or close the tip — closing it is a choice of Latin,
 * so it is not offered again. Each switch then briefly says how to go back.
 * "Tap" or "Click" is the stylesheet's call, by whether the pointer hovers.
 */
export function ScriptSwitch({ tips, children }: ScriptSwitchProps) {
  const { script, chosen, choose } = useScriptPreference();
  const [switched, setSwitched] = useState(false);

  useEffect(() => {
    if (!switched) return;

    const timer = setTimeout(() => {
      setSwitched(false);
    }, AFTER_SWITCH_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [switched, script]);

  const firstVisit = !chosen;

  function close() {
    if (firstVisit) choose('latin');
    setSwitched(false);
  }

  return (
    <Popover
      opened={firstVisit || switched}
      onChange={(opened) => {
        if (!opened) close();
      }}
      closeOnClickOutside={!firstVisit}
      position="bottom-start"
      shadow="md"
      withArrow
    >
      <Popover.Target>
        <UnstyledButton
          className={classes['scriptSwitch']}
          aria-pressed={script === 'original'}
          onClick={() => {
            choose(script === 'latin' ? 'original' : 'latin');
            setSwitched(true);
          }}
        >
          {children}
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown className={classes['note']}>
        <Group gap={8} wrap="nowrap" align="flex-start">
          <PointerWords
            {...tips[script === 'latin' ? 'toOriginal' : 'toLatin']}
          />
          {firstVisit && (
            <CloseButton size="sm" aria-label={tips.close} onClick={close} />
          )}
        </Group>
      </Popover.Dropdown>
    </Popover>
  );
}

type PointerWordsProps = Record<'tap' | 'click', string>;

/** One sentence in two wordings, the stylesheet showing the pointer's. */
function PointerWords({ tap, click }: PointerWordsProps) {
  return (
    <span>
      <span className={classes['onTouch']}>{tap}</span>
      <span className={classes['onHover']}>{click}</span>
    </span>
  );
}

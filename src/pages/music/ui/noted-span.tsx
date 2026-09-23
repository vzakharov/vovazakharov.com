'use client';

import { Popover, UnstyledButton } from '@mantine/core';
import { type PointerEvent, useRef, useState } from 'react';

import type { WithChildren, WithText } from '@/shared/typings';

import classes from './music.module.scss';

export type NotedSpanProps = WithText & WithChildren;

/**
 * Who has the note open. A hover lets go when the pointer leaves; a press —
 * a tap, a click, a key — holds it until the next press or a click elsewhere.
 */
type Opener = 'hover' | 'press';

// Long enough to cross the gap from the words to the note without it closing
// under the pointer.
const HOVER_GRACE_MS = 150;

/**
 * Words of verse carrying a note, as genius.com marks them: the note opens on
 * a hover where the pointer can hover, and on a press everywhere — a phone has
 * no hover, and a note can carry a link the reader has to reach. The pointer's
 * own type decides rather than a media query, so a laptop with a touchscreen
 * gets both.
 *
 * Mounted while closed and kept out of a portal, so the note is in the static
 * HTML beside its words — which is also what carries the popover's classes into
 * the export `check:mantine-styles` compares against. Positioned `fixed` for
 * the same reason: out of a portal it sits inside the lyrics' scrolling box,
 * which would otherwise clip a note that drops below the last stanza.
 */
export function NotedSpan({ text, children }: NotedSpanProps) {
  const [opener, setOpener] = useState<Opener>();
  const closingRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const hover = {
    onPointerEnter: ({ pointerType }: PointerEvent) => {
      if (pointerType !== 'mouse') return;
      clearTimeout(closingRef.current);
      setOpener((current) => current ?? 'hover');
    },
    onPointerLeave: ({ pointerType }: PointerEvent) => {
      if (pointerType !== 'mouse') return;
      closingRef.current = setTimeout(() => {
        setOpener((current) => (current === 'hover' ? undefined : current));
      }, HOVER_GRACE_MS);
    },
  };

  return (
    <Popover
      opened={opener !== undefined}
      onChange={(opened) => {
        if (!opened) setOpener(undefined);
      }}
      position="bottom-start"
      width={320}
      shadow="md"
      keepMounted
      keepMountedMode="display-none"
      withinPortal={false}
      floatingStrategy="fixed"
    >
      <Popover.Target>
        <UnstyledButton
          className={classes['notedSpan']}
          onClick={() => {
            setOpener((current) => (current === 'press' ? undefined : 'press'));
          }}
          {...hover}
        >
          {text}
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown className={classes['note']} {...hover}>
        {children}
      </Popover.Dropdown>
    </Popover>
  );
}

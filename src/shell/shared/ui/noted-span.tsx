'use client';

import { Popover, UnstyledButton } from '@mantine/core';
import { type PointerEvent, type ReactNode, useRef, useState } from 'react';

import type { WithChildren } from '@/kernel/shared/typings';

import classes from './noted-span.module.scss';

/** The words the note hangs off, as set; the note itself is the children. */
export type NotedSpanProps = WithChildren & {
  words: ReactNode;
  /**
   * The words keep their own press — a link, say — so the note opens on a
   * hover alone, and a pointer that cannot hover never sees it.
   */
  hoverOnly?: boolean;
};

/**
 * Who has the note open. A hover lets go when the pointer leaves; a press —
 * a tap, a click, a key — holds it until the next press or a click elsewhere.
 */
type Opener = 'hover' | 'press';

// Long enough to cross the gap from the words to the note without it closing
// under the pointer.
const HOVER_GRACE_MS = 150;

/**
 * Words carrying a note, as genius.com marks them: the note opens on a hover
 * where the pointer can hover, and on a press everywhere — a phone has no
 * hover, and a note can carry a link the reader has to reach. The pointer's
 * own type decides rather than a media query, so a laptop with a touchscreen
 * gets both.
 *
 * Mounted while closed and kept out of a portal, so the note is in the static
 * HTML beside its words — which is also what carries the popover's classes into
 * the export `check:mantine-styles` compares against. Out of a portal it sits
 * inside whatever box holds its words, which is why it is positioned `fixed`:
 * a scrolling one, as the lyrics are, would clip a note dropping below it.
 * The note is a `<div>`, so the words never sit in a `<p>`: React rejects the
 * nesting at hydration.
 */
export function NotedSpan({
  words,
  children,
  hoverOnly = false,
}: NotedSpanProps) {
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
        {hoverOnly ? (
          <span {...hover}>{words}</span>
        ) : (
          <UnstyledButton
            className={classes['notedSpan']}
            onClick={() => {
              setOpener((current) =>
                current === 'press' ? undefined : 'press',
              );
            }}
            {...hover}
          >
            {words}
          </UnstyledButton>
        )}
      </Popover.Target>
      <Popover.Dropdown className={classes['note']} {...hover}>
        {children}
      </Popover.Dropdown>
    </Popover>
  );
}

'use client';

import { UnstyledButton } from '@mantine/core';
import { useEffect, useId, useRef, useState } from 'react';

import { cx } from '@/shared/lib/class-names';
import type { LabeledBlock } from '@/shared/typings';
import { hoverDim } from '@/shared/ui';

import classes from './read-more.module.scss';

/**
 * Text held to a fixed height on screen, all of it still in the static HTML.
 * Only text that overflows the height fades out above a «…», which lets the
 * rest down in place; `label` names that control for assistive tech.
 */
export function ReadMore({ label, children }: LabeledBlock) {
  const id = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const box = boxRef.current;
    const content = contentRef.current;

    if (!box || !content || expanded) return;

    // The box's width moves the line breaks, and the content's own height
    // moves with images and fonts landing, so either can tip it over.
    const observer = new ResizeObserver(() => {
      setOverflowing(box.scrollHeight > box.clientHeight + 1);
    });

    observer.observe(box);
    observer.observe(content);

    return () => {
      observer.disconnect();
    };
  }, [expanded]);

  return (
    <div>
      <div
        ref={boxRef}
        {...{ id }}
        // The button goes once pressed, so focus lands on the text it opened
        // rather than falling back to the top of the document.
        tabIndex={-1}
        className={cx(classes['box'], !expanded && classes['clamped'])}
        data-overflowing={overflowing}
      >
        <div ref={contentRef}>{children}</div>
      </div>

      {overflowing && !expanded && (
        <UnstyledButton
          className={cx('print-hidden', hoverDim, classes['more'])}
          aria-label={label}
          aria-expanded={false}
          aria-controls={id}
          onClick={() => {
            setExpanded(true);
            boxRef.current?.focus({ preventScroll: true });
          }}
        >
          …
        </UnstyledButton>
      )}
    </div>
  );
}

'use client';

import { Anchor } from '@mantine/core';

import { cx } from '@/shared/lib/class-names';
import type { DocumentFile, WithChildren } from '@/shared/typings';

import { hoverDim } from './hover-dim';

export type FileLinkProps = DocumentFile & WithChildren;

/**
 * One of a page's own files, served at that page's URL plus an extension. It
 * saves rather than opens, so the file never replaces the page in the tab.
 */
export function FileLink({ href, download, children }: FileLinkProps) {
  return (
    <Anchor
      {...{ href, download }}
      size="sm"
      className={cx('print-hidden', hoverDim)}
    >
      {children}
    </Anchor>
  );
}

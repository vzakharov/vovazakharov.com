'use client';

import { Anchor } from '@mantine/core';

import { cx } from '@/shared/lib/class-names';
import type { DocumentFile, WithChildren } from '@/shared/typings';

import classes from './file-link.module.scss';

export type FileLinkProps = DocumentFile & WithChildren;

/**
 * One of a page's own files, served at that page's URL plus an extension. It
 * saves rather than opens, so the file never replaces the page in the tab;
 * hidden in print, where the reader is holding one of them already.
 */
export function FileLink({ href, download, children }: FileLinkProps) {
  return (
    <Anchor
      {...{ href, download }}
      size="sm"
      className={cx('print-hidden', classes['hoverDim'])}
    >
      {children}
    </Anchor>
  );
}

'use client';

import Image from 'next/image';
import { useRef } from 'react';

import { cx } from '@/kernel/shared/lib/class-names';
import type { Sourced } from '@/kernel/shared/typings';

import classes from './cover.module.scss';

export type CoverZoomLabels = {
  enlargeLabel: string;
  closeLabel: string;
};

export type CoverZoomProps = Sourced &
  CoverZoomLabels & {
    /** The thumbnail's size, in place of a song page's. */
    sizeClass?: string | undefined;
  };

/**
 * A cover, opening at full size in a native modal `<dialog>`. The dialog is one
 * close button filling the viewport, so any click closes it.
 */
export function CoverZoom({
  src,
  enlargeLabel,
  closeLabel,
  sizeClass = classes['cover'],
}: CoverZoomProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // One file for the thumbnail and the full size, so opening fetches nothing.
  const art = { src, width: 600, height: 600 };

  return (
    <>
      <button
        type="button"
        className={cx(classes['art'], sizeClass, classes['coverOpen'])}
        aria-label={enlargeLabel}
        onClick={() => dialogRef.current?.showModal()}
      >
        <Image {...art} alt="" sizes="200px" priority />
      </button>

      <dialog ref={dialogRef} className={classes['coverDialog']}>
        <form method="dialog" className={classes['coverForm']}>
          <button
            type="submit"
            className={classes['coverClose']}
            aria-label={closeLabel}
          >
            <Image {...art} alt="" sizes="600px" />
          </button>
        </form>
      </dialog>
    </>
  );
}

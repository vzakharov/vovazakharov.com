'use client';

import Image from 'next/image';
import { useRef } from 'react';

import { cx } from '@/shared/lib/class-names';
import type { Sourced } from '@/shared/typings';

import classes from './music.module.scss';

export type CoverZoomProps = Sourced & {
  enlargeLabel: string;
  closeLabel: string;
};

/**
 * A song page's cover, opening at full size in a native modal `<dialog>`. The
 * dialog is one close button filling the viewport, so any click closes it.
 */
export function CoverZoom({ src, enlargeLabel, closeLabel }: CoverZoomProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // One file for the thumbnail and the full size, so opening fetches nothing.
  const art = { src, width: 600, height: 600 };

  return (
    <>
      <button
        type="button"
        className={cx(
          classes['tileArt'],
          classes['songCover'],
          classes['coverOpen'],
        )}
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

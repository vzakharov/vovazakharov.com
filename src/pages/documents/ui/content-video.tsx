import type { ComponentProps } from 'react';

import { printedUrl } from '@/shared/config';
import { cx } from '@/shared/lib/class-names';
import { pick } from '@/shared/lib/collections';

/**
 * Every `<video>` a document holds — the one `rehypeMediaEmbeds` makes out of a
 * link and one an author typed as raw HTML alike: a player on screen, and on
 * paper the URL it would otherwise print as a blank rectangle.
 */
export function ContentVideo({
  src,
  className,
  children,
  ...props
}: ComponentProps<'video'>) {
  // React also takes a `Blob` or a stream as a `src`, neither of which a
  // statically rendered page has — so only a URL has a printed form to offer.
  const url = typeof src === 'string' ? src : undefined;
  const printed = url === undefined ? undefined : printedUrl(url);

  return (
    <>
      <video
        controls
        muted
        preload="metadata"
        playsInline
        {...props}
        {...{ src }}
        className={cx('content-video print-hidden', className)}
      >
        {children ?? (
          <p>
            {/* TODO: localize, with the printed note below, once the
                `<slug>.<locale>.md` seam gives a document its locale. */}
            Your browser can’t play this video —{' '}
            <a href={url} download>
              download it
            </a>{' '}
            instead.
          </p>
        )}
      </video>

      {printed && (
        <p className="print-only content-video-note">
          <em>
            See video at <a {...pick(printed, 'href')}>{printed.text}</a>
          </em>
        </p>
      )}
    </>
  );
}

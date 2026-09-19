import { printedUrl } from '@/shared/config/index.server-only';

type Props = {
  /** The video's URL, as the document authored it. */
  src: string;
  /** The link text the document gave it, which becomes the accessible label. */
  label: string;
};

/**
 * A video as the site plays it and as paper reports it. A player prints as a
 * blank rectangle, so the printed copy gets the URL instead — which is only
 * useful if a reader can type it off the page.
 */
export function ContentVideo({ src, label }: Props) {
  const { href, text } = printedUrl(src);

  return (
    <>
      <video
        {...{ src }}
        controls
        preload="metadata"
        playsInline
        className="content-video print-hidden"
        aria-label={label}
      >
        <p>
          {/*
            TODO: localize, along with the printed note below. Both are English
            because content pages are; they need the document's locale once the
            `<slug>.<locale>.md` seam is built.
          */}
          Your browser can’t play this video —{' '}
          <a href={src} download>
            download it
          </a>{' '}
          instead.
        </p>
      </video>

      <p className="print-only content-video-note">
        <em>
          See video at <a {...{ href }}>{text}</a>
        </em>
      </p>
    </>
  );
}

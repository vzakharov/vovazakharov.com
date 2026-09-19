import { printedUrl } from '@/shared/config/index.server-only';

type Props = {
  src: string;
  /** The link text the document gave the video, which labels the player. */
  label: string;
};

/**
 * A player on screen, and on paper the URL it would print as a blank rectangle.
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
          {/* TODO: localize, with the printed note below, once the
              `<slug>.<locale>.md` seam gives a document its locale. */}
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

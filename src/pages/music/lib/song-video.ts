import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import { PUBLIC_DIR } from '@/shared/content';
import { type Locale, LOCALES } from '@/shared/i18n';
import type { Labeled, Sourced } from '@/shared/typings';

import type { SongDocument } from './song-text';

/**
 * One WebVTT file beside a song's video, as the `<track>` that loads it reads
 * it. The page's own language is the one shown from the start.
 */
type CaptionTrack = Sourced &
  Labeled & {
    srcLang: string;
    default: boolean;
  };

/** A song's video with the tracks that caption it. */
export type SongVideo = {
  video: string;
  /** The frontmatter's `video.offsetSeconds`. */
  offsetSeconds: number;
  /** The sung words, in the language they are sung in. */
  captions: CaptionTrack;
  /** The cribs, each in a locale's language other than the sung one. */
  subtitles: CaptionTrack[];
};

/**
 * The tracks `scripts/song-intake/captions.py` writes beside a song's video, one
 * per lyrics column, at the video's path with `.<language>.vtt` for its
 * extension. Throws where the sung words have no track, or the video lives off
 * the site where no track can sit beside it, so a video without its words fails
 * the build rather than reaching a reader who cannot hear it.
 */
export function songVideo(
  { frontmatter: { video: authored, language }, fileName }: SongDocument,
  locale: Locale,
): SongVideo | undefined {
  if (authored === undefined) return undefined;

  const { src: video, offsetSeconds } = authored;
  const [sung] = language;

  if (!video.startsWith('/') || sung === undefined || sung === 'instrumental') {
    throw new Error(
      `${fileName}: a song's video is captioned with its sung words, so it needs words and a site-hosted file for its tracks to sit beside.`,
    );
  }

  const names = new Intl.DisplayNames(locale, { type: 'language' });
  const stem = video.slice(0, video.length - path.extname(video).length);
  const trackSrc = (srcLang: string) => `${stem}.${srcLang}.vtt`;
  const track = (srcLang: string): CaptionTrack | undefined => {
    const src = trackSrc(srcLang);
    const name = names.of(srcLang) ?? srcLang;

    return fs.existsSync(path.join(PUBLIC_DIR, src))
      ? {
          src,
          srcLang,
          label: name.charAt(0).toLocaleUpperCase(locale) + name.slice(1),
          default: srcLang === locale,
        }
      : undefined;
  };

  const captions = track(sung);

  if (captions === undefined) {
    throw new Error(
      `${fileName}: no captions at ${trackSrc(sung)}; scripts/song-intake/captions.py writes them.`,
    );
  }

  const subtitles = LOCALES.filter((other) => other !== sung).flatMap(
    (other) => track(other) ?? [],
  );

  return { video, offsetSeconds, captions, subtitles };
}

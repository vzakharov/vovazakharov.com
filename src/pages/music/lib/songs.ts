import { listPrimaryDocuments, SONGS } from '@/shared/content';

import type { PlayerTrack } from './player-state';

/**
 * The catalogue, newest first, reduced to what the player needs. Resolved here
 * at build time and handed down as props, which is what keeps `shared/content`
 * — and with it `gray-matter`, `zod` and the whole remark stack — out of the
 * browser while the player still has a queue to work from.
 */
export function listSongs(): PlayerTrack[] {
  return listPrimaryDocuments(SONGS).map(({ slug, route, frontmatter }) => {
    const { name, project, audio, seconds } = frontmatter;

    return { slug, route, name, audio, seconds, ...(project && { project }) };
  });
}

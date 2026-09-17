import { FEATURED_CASE_STUDY_ROUTE } from '@/shared/content';

import { cvMessages } from '../lib/cv-messages';
import type { CvEdition } from '../lib/cv-variants';
import { CvSheet } from './cv-sheet';

/**
 * The seam where an address becomes copy: the sheet below renders on the server
 * from the catalogue this resolves, so no page ships next-intl's client runtime
 * (`.claude/rules/i18n.md`).
 */
export function CvPage({ locale, variant }: CvEdition) {
  return (
    <CvSheet
      {...{ locale, variant }}
      messages={cvMessages(locale, variant)}
      caseStudyHref={FEATURED_CASE_STUDY_ROUTE}
    />
  );
}

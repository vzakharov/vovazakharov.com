import { FEATURED_CASE_STUDY_ROUTE } from '@/blog/shared/content';

import { type CvEdition, cvMessages, type CvSubpage } from '@/vova/entities/cv';

import { CASE_STUDY_KEY } from '../../frame';
import { CvSheet } from '../../full';
import { CvProfileSheet } from '../../profile';
import { cvPdfFile } from '../lib/cv-files';

/**
 * The seam where an address becomes copy: the sheet below renders on the server
 * from the catalogue this resolves, so no page ships next-intl's client runtime
 * (`.claude/rules/i18n.md`).
 */
export function CvPage({
  locale,
  variant,
  subpage,
}: CvEdition & { subpage?: CvSubpage }) {
  const messages = cvMessages(locale, variant);
  const caseStudy = {
    href: FEATURED_CASE_STUDY_ROUTE,
    label: messages.cv.caseStudies[CASE_STUDY_KEY].link,
  };

  if (subpage === 'profile') {
    return <CvProfileSheet {...{ locale, variant, messages, caseStudy }} />;
  }

  return (
    <CvSheet
      {...{ locale, variant, messages, caseStudy }}
      pdfFile={cvPdfFile(variant, locale)}
    />
  );
}

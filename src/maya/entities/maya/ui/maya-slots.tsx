import { SITE_CONFIG } from '@/kernel/shared/config';

import type { ArticleSlots } from '@/blog/shared/article-slots';
import type { ArticleFrontmatter } from '@/blog/shared/content';

import { plateNumber } from '../lib/plate-number';
import { MayaByline } from './maya-byline';
import { PlateLabel } from './plate-label';

/** An entry's additions to the article page: its plate number, and her byline. */
export const MAYA_SLOTS: ArticleSlots<ArticleFrontmatter> = {
  eyebrow: ({ slug, locale = SITE_CONFIG.locale }) => {
    const number = plateNumber(slug, locale);

    return number !== undefined && <PlateLabel {...{ number, locale }} />;
  },
  byline: ({ locale = SITE_CONFIG.locale }) => <MayaByline {...{ locale }} />,
};

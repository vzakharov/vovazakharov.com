import type { ArticleSlots } from '@/blog/shared/article-slots';

import type { CaseFrontmatter } from '@/basilisk/shared/content';

import { CaseBrief } from './case-brief';
import { CaseSeal } from './case-seal';
import { NoAiNote } from './no-ai-note';

/** A dossier's additions to the article page. */
export const caseSlots: ArticleSlots<CaseFrontmatter> = ({
  slug,
  frontmatter,
}) => ({
  mark: <CaseSeal {...{ slug }} />,
  brief: <CaseBrief {...{ frontmatter }} />,
  afterLead: frontmatter.noAi === true && <NoAiNote />,
});

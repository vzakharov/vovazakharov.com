import type { CaseFrontmatter } from '@/basilisk/shared/content';
import type { ArticleSlots } from '@/blog/shared/article-slots';

import { CaseBrief } from './case-brief';
import { NoAiNote } from './no-ai-note';

/** A dossier's additions to the article page: its case file, and the no-AI pointer. */
export const CASE_SLOTS: ArticleSlots<CaseFrontmatter> = {
  brief: ({ frontmatter }) => <CaseBrief {...{ frontmatter }} />,
  afterLead: ({ frontmatter }) => frontmatter.noAi === true && <NoAiNote />,
};

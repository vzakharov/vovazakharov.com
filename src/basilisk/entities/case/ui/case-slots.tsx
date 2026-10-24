import type { ArticleSlots } from '@/blog/shared/article-slots';

import type { CaseFrontmatter } from '@/basilisk/shared/content';

import { CaseBrief } from './case-brief';
import { CaseSeal } from './case-seal';
import { NoAiNote } from './no-ai-note';

/** A dossier's additions to the article page: its seal, its case file, and the no-AI pointer. */
export const CASE_SLOTS: ArticleSlots<CaseFrontmatter> = {
  mark: ({ slug }) => <CaseSeal {...{ slug }} />,
  brief: ({ frontmatter }) => <CaseBrief {...{ frontmatter }} />,
  afterLead: ({ frontmatter }) => frontmatter.noAi === true && <NoAiNote />,
};

import 'server-only';

import { z } from 'zod';

// The leaf rather than the barrel, as basilisk's cases do: the render scripts
// parse the posts through `POSTS`, and the barrel would load the whole render
// pipeline into them.
import {
  articleFrontmatterSchema,
  type Collection,
} from '@/blog/shared/content/frontmatter';

import { plainLede } from './lede';
import { occasionSchema } from './occasion';

/**
 * An article written for a day, and every post is one. Its `description` may
 * mark a run `_…_` for italics: the page, the index and the card read it as
 * `lede`, and `description` itself carries the plain words to meta and feed.
 */
const postFrontmatterSchema = articleFrontmatterSchema
  .extend({
    occasion: occasionSchema,
    /** What the social card types in its name field, where the first `name` widget's word is not it. */
    field: z.string().min(1).optional(),
  })
  .transform(({ description, ...frontmatter }) => ({
    ...frontmatter,
    description: plainLede(description),
    lede: description,
  }));

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;

export const POSTS: Collection<PostFrontmatter> = {
  id: 'unsquatted-blog',
  schema: postFrontmatterSchema,
};

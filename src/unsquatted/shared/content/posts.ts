import 'server-only';

import type { z } from 'zod';

// The leaf rather than the barrel, as basilisk's cases do: the render scripts
// parse the posts through `POSTS`, and the barrel would load the whole render
// pipeline into them.
import {
  articleFrontmatterSchema,
  type Collection,
} from '@/blog/shared/content/frontmatter';

import { occasionSchema } from './occasion';

/** An article written for a day, and every post is one. */
const postFrontmatterSchema = articleFrontmatterSchema.extend({
  occasion: occasionSchema,
});

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;

export const POSTS: Collection<PostFrontmatter> = {
  id: 'unsquatted-blog',
  schema: postFrontmatterSchema,
};

import { articleRoute } from '@/blog/pages/article';

import { POSTS } from '@/unsquatted/shared/content';
import { postSlots } from '@/unsquatted/pages/post';

const { Page, generateMetadata, generateStaticParams } = articleRoute(
  POSTS,
  postSlots,
);

export { generateMetadata, generateStaticParams };
export default Page;

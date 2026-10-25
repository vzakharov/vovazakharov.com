import { articleCollection } from '@/kernel/shared/content';

import { articleRoute } from '@/blog/pages/documents';

const { Page, generateMetadata, generateStaticParams } = articleRoute(
  articleCollection('maya-blog'),
);

export { generateMetadata, generateStaticParams };
export default Page;

import { articleCollection } from '@/kernel/shared/content';

import { articleRoute } from '@/blog/pages/documents';

const { Page, generateMetadata, generateStaticParams } = articleRoute(
  articleCollection('case-studies'),
);

export { generateMetadata, generateStaticParams };
export default Page;

import { articleCollection } from '@/blog/shared/content';
import { articleRoute } from '@/blog/pages/documents';

import { MAYA_SLOTS } from '@/maya/entities/maya';

const { Page, generateMetadata, generateStaticParams } = articleRoute(
  articleCollection('maya-blog'),
  MAYA_SLOTS,
);

export { generateMetadata, generateStaticParams };
export default Page;

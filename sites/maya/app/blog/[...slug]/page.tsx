import { articleCollection } from '@/blog/shared/content';
import { articleRoute } from '@/blog/pages/documents';

import { mayaSlots } from '@/maya/entities/maya';

const { Page, generateMetadata, generateStaticParams } = articleRoute(
  articleCollection('maya-blog'),
  mayaSlots,
);

export { generateMetadata, generateStaticParams };
export default Page;

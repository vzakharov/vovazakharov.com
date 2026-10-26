import { articleCollection } from '@/blog/shared/content';
import { articleRoute } from '@/blog/pages/documents';

const { Page, generateMetadata, generateStaticParams } = articleRoute(
  articleCollection('bible'),
);

export { generateMetadata, generateStaticParams };
export default Page;

import { articleCollection } from '@/blog/shared/content';
import { articleRoute } from '@/blog/pages/article';

const { Page, generateMetadata, generateStaticParams } = articleRoute(
  articleCollection('lsa-blog'),
);

export { generateMetadata, generateStaticParams };
export default Page;

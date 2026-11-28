import { articleCollection } from '@/blog/shared/content';
import { articleRoute } from '@/blog/pages/article';

const { Page, generateMetadata, generateStaticParams } = articleRoute(
  articleCollection('basilisk-faq'),
);

export { generateMetadata, generateStaticParams };
export default Page;

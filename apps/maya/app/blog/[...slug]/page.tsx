import { articleRoute } from '@/pages/documents';

const { Page, generateMetadata, generateStaticParams } =
  articleRoute('maya-blog');

export { generateMetadata, generateStaticParams };
export default Page;

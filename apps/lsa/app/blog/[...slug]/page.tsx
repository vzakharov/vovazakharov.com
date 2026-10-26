import { articleRoute } from '@/pages/documents';

const { Page, generateMetadata, generateStaticParams } =
  articleRoute('lsa-blog');

export { generateMetadata, generateStaticParams };
export default Page;

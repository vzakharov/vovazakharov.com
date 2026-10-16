import { articleRoute } from '@/blog/pages/documents';

const { Page, generateMetadata, generateStaticParams } =
  articleRoute('case-studies');

export { generateMetadata, generateStaticParams };
export default Page;

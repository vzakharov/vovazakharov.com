import { articleRoute } from '@/blog/pages/documents';

const { Page, generateMetadata, generateStaticParams } =
  articleRoute('basilisk-faq');

export { generateMetadata, generateStaticParams };
export default Page;

import { articleRoute } from '@/pages/documents';

const { Page, generateMetadata, generateStaticParams } =
  articleRoute('basilisk-cases');

export { generateMetadata, generateStaticParams };
export default Page;

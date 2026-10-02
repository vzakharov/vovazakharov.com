import { articleRoute } from '@/pages/documents';

const { Page, generateMetadata, generateStaticParams } =
  articleRoute('dossiers');

export { generateMetadata, generateStaticParams };
export default Page;

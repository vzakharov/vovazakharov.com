import { articleRoute } from '@/pages/documents';

const { Page, generateMetadata, generateStaticParams } = articleRoute('cases');

export { generateMetadata, generateStaticParams };
export default Page;

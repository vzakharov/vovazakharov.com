import { articleRoute } from '@/pages/documents';

const { Page, generateMetadata, generateStaticParams } = articleRoute('faq');

export { generateMetadata, generateStaticParams };
export default Page;

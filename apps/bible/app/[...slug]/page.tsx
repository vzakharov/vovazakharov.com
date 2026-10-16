import { articleRoute } from '@/blog/pages/documents';

const { Page, generateMetadata, generateStaticParams } = articleRoute('bible');

export { generateMetadata, generateStaticParams };
export default Page;

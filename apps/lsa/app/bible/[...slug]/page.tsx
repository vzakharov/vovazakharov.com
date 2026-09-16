import { articleRoute } from '@/pages/documents';

const { Page, generateMetadata, generateStaticParams } = articleRoute('bible');

export { generateMetadata, generateStaticParams, Page as default };

import { articleRoute } from '@/blog/pages/documents';

import { CASES } from '@/basilisk/shared/content';
import { CASE_SLOTS } from '@/basilisk/entities/case';

const { Page, generateMetadata, generateStaticParams } = articleRoute(
  CASES,
  CASE_SLOTS,
);

export { generateMetadata, generateStaticParams };
export default Page;

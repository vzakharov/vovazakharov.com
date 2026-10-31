import { articleRoute } from '@/blog/pages/documents';

import { CASES } from '@/basilisk/shared/content';
import { caseSlots } from '@/basilisk/entities/case';

const { Page, generateMetadata, generateStaticParams } = articleRoute(
  CASES,
  caseSlots,
);

export { generateMetadata, generateStaticParams };
export default Page;

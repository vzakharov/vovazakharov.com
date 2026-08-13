import { constructMetadata } from '@/lib/metadata';

export const metadata = constructMetadata({
  title: 'Rebuilding Playgram — Vova Zakharov',
  description:
    'Five months, a no-code platform retired, and the machine that made it possible: how a live Bubble.io product was rebuilt as a production TypeScript codebase.',
  path: '/case/playgram',
  ogType: 'article',
});

export { default } from './CaseStudy';

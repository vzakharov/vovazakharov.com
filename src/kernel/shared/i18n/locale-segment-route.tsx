import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import type { WithParams } from '@/kernel/shared/typings';

import {
  localeSegmentParams,
  parseLocaleSegment,
  type WithLocale,
  type WithLocaleSegment,
} from './locales';

type Props = WithParams<WithLocaleSegment>;

/**
 * A page at its locale-less alias and once per language — a `[[...locale]]`
 * route — as the three exports Next reads off the route module, so the router
 * destructures and re-exports rather than parsing the segment itself.
 */
export function localeSegmentRoute(
  render: (props: WithLocale) => ReactNode | Promise<ReactNode>,
  metadata: (props: WithLocale) => Metadata,
) {
  async function Page({ params }: Props) {
    return render({ locale: parseLocaleSegment(await params) });
  }

  async function generateMetadata({ params }: Props) {
    return metadata({ locale: parseLocaleSegment(await params) });
  }

  return { Page, generateMetadata, generateStaticParams: localeSegmentParams };
}

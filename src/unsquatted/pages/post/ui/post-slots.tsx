import { pick } from '@/kernel/shared/lib/collections';

import type {
  ArticleSlots,
  WidgetComponents,
} from '@/blog/shared/article-slots';
import type { WidgetPlaceholder } from '@/blog/shared/content';

import {
  domainsList,
  nameAcross,
  type PostFrontmatter,
} from '@/unsquatted/shared/content';
import { COPY } from '@/unsquatted/shared/i18n';
import {
  fetchPrices,
  type Prices,
} from '@/unsquatted/entities/domain/index.node-safe';
import { OccasionEyebrow } from '@/unsquatted/entities/post';

import { checkerHref } from '../lib/checker-href';
import { FieldHead, LabelHead, WidgetCard } from './widget-card';

let pricesFetched: Promise<Prices> | undefined;

/** Once per build, however many widgets its posts hold. */
const prices = async () => (pricesFetched ??= fetchPrices());

/** A curated list of domains, under its label. */
async function DomainsWidget(placeholder: WidgetPlaceholder) {
  const { label, domains, anchor } = domainsList(placeholder);
  const zonePrices = await prices();

  return (
    <WidgetCard
      head={<LabelHead {...{ label }} />}
      cardName={label}
      more={{ href: '/', text: COPY.widget.checkOwn }}
      copy={COPY}
      prices={zonePrices}
      {...{ anchor, domains }}
    />
  );
}

/** One word in a few zones, under the field that holds it. */
async function NameWidget(placeholder: WidgetPlaceholder) {
  const { word, domains, note, anchor } = nameAcross(placeholder);
  const zonePrices = await prices();

  return (
    <WidgetCard
      head={<FieldHead {...{ word }} />}
      cardName={word}
      more={{ href: checkerHref(word), text: COPY.widget.tryAnother }}
      copy={COPY}
      prices={zonePrices}
      {...{ anchor, domains, note }}
    />
  );
}

/** One per name the `unsquatted-blog` registry entry lists. */
const WIDGETS: WidgetComponents = {
  domains: DomainsWidget,
  name: NameWidget,
};

/** A post's additions to the article page: its occasion, and its widgets. */
export const postSlots: ArticleSlots<PostFrontmatter> = ({ frontmatter }) => ({
  eyebrow: <OccasionEyebrow {...pick(frontmatter, 'occasion')} />,
  widgets: WIDGETS,
});

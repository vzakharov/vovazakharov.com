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
import { Masthead } from '@/unsquatted/widgets/masthead';

import { checkerHref } from '../../checker-href';
import { FieldHead, LabelHead, WidgetCard } from '../../widget-card';
import { PostHeader } from './post-header';

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

/**
 * A post on the article page: the site's masthead over it, its own header, its
 * widgets, and no outline beside it.
 */
export const postSlots: ArticleSlots<PostFrontmatter> = (document) => ({
  masthead: <Masthead inBlog />,
  header: (headline) => <PostHeader {...headline} {...{ document }} />,
  widgets: WIDGETS,
  outlineless: true,
});

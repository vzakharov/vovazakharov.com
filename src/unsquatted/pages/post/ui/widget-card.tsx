'use client';

import Link from 'next/link';
import { type ReactNode, useRef } from 'react';

import { pick } from '@/kernel/shared/lib/collections';

import {
  type CopiedPrices,
  labelOf,
  useVerdicts,
  VerdictLabel,
  zoneOf,
} from '@/unsquatted/entities/domain';
import { LikeButton, LikesProvider } from '@/unsquatted/features/like';
import { SharePopover } from '@/unsquatted/widgets/field-tools';

import { checkerHref } from '../lib/checker-href';
import { snapshot } from './snapshot';
import classes from './widget-card.module.scss';

type WidgetCardProps = CopiedPrices & {
  /** The figure's id, which a copied link opens on. */
  anchor: string;
  /** What the card is headed with: a label, or the word in a field. */
  head: ReactNode;
  /** The word the widget's image is named for. */
  cardName: string;
  domains: readonly string[];
  /** The line under the rows, if any. */
  note?: string | undefined;
  /** Where the foot sends a reader for more, and in what words. */
  more: { href: string; text: string };
};

/**
 * A post's widget: its domains, each looked up live on every visit as the
 * catalogue's rows are, so one grabbed since the post went up says so. Each
 * domain opens in the home page's checker, and the foot leads there too.
 */
function Card({
  anchor,
  head,
  cardName,
  domains,
  note,
  more,
  prices,
  copy,
}: WidgetCardProps) {
  const verdicts = useVerdicts(domains);
  const looking = verdicts.size < domains.length;
  const figureRef = useRef<HTMLElement>(null);

  return (
    <figure ref={figureRef} id={anchor} className={classes['card']}>
      {head}
      <ul className={classes['rows']}>
        {domains.map((domain) => (
          <li key={domain} className={classes['row']}>
            <LikeButton
              variant="subtle"
              size="sm"
              className={classes['like']}
              name={labelOf(domain)}
              zone={zoneOf(domain)}
              iconSize={16}
              {...{ copy }}
            />
            <Link href={checkerHref(domain)} className={classes['domain']}>
              {domain}
            </Link>
            <VerdictLabel
              {...{ domain, copy }}
              verdict={verdicts.get(domain)}
              price={prices[zoneOf(domain)]}
            />
          </li>
        ))}
      </ul>
      {note !== undefined && <p className={classes['note']}>{note}</p>}
      <div className={classes['foot']}>
        <Link {...pick(more, 'href')} className={classes['more']}>
          {more.text}
        </Link>
        <SharePopover
          typed={anchor}
          label={cardName}
          labelled
          className={classes['share']}
          drawCard={async () => {
            const figure = figureRef.current;
            if (figure === null)
              throw new Error(`The widget ${anchor} is not on the page`);

            return snapshot(figure, classes['frame'], cardName);
          }}
          onReached={() => {
            // Every domain is looked up on render: nothing waits to be asked.
          }}
          {...{ looking, copy }}
        />
      </div>
    </figure>
  );
}

/**
 * The card with the visitor's shortlist at hand, which every card on the page
 * and the home page share through the browser's storage.
 */
export function WidgetCard(props: WidgetCardProps) {
  return (
    <LikesProvider>
      <Card {...props} />
    </LikesProvider>
  );
}

type FieldHeadProps = { word: string };

/** The word as the checker's field would hold it. */
export function FieldHead({ word }: FieldHeadProps) {
  return (
    <Link href={checkerHref(word)} className={classes['field']}>
      {word}
    </Link>
  );
}

type LabelHeadProps = { label: string };

export function LabelHead({ label }: LabelHeadProps) {
  return <figcaption className={classes['label']}>{label}</figcaption>;
}

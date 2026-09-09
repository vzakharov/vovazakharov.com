import { List, ListItem } from '@mantine/core';

import { cx } from '@/shared/lib/class-names';
import type { Labeled, WithText } from '@/shared/typings';

import classes from './cv.module.scss';

/**
 * Bold first words that name what follows, so the renderer sets the colon
 * between them — which is what lets another page show the label on its own.
 */
type LabeledText = Labeled & WithText;

/** Bold first words the rest of the sentence continues from, punctuation included. */
type LedText = WithText & { lead: string };

export type BulletItem = string | LabeledText | LedText;

type CvBulletsProps = {
  items: BulletItem[];
  /** Drops the trailing gap where nothing follows the list in its card. */
  last?: boolean;
};

type BulletProps = { item: BulletItem };

function Bullet({ item }: BulletProps) {
  if (typeof item === 'string') return item;

  if ('label' in item) {
    const { label, text } = item;

    return (
      <>
        <strong>{label}:</strong> {text}
      </>
    );
  }

  const { lead, text } = item;

  return (
    <>
      <strong>{lead}</strong> {text}
    </>
  );
}

export function CvBullets({ items, last = false }: CvBulletsProps) {
  return (
    <List className={cx(classes['bullets'], !last && classes['tight'])}>
      {items.map((item, index) => (
        <ListItem key={index}>
          <Bullet {...{ item }} />
        </ListItem>
      ))}
    </List>
  );
}

import { List, ListItem } from '@mantine/core';
import { cx } from '@/shared/lib/class-names';
import classes from './cv.module.scss';

/** A plain bullet, or one whose first words are set in bold as a label. */
export type BulletItem = string | { label: string; text: string };

export function CvBullets({
  items,
  last,
}: {
  items: BulletItem[];
  /** Drops the trailing gap where nothing follows the list in its card. */
  last?: boolean;
}) {
  return (
    <List className={cx(classes.bullets, !last && classes.tight)}>
      {items.map((item, index) => (
        <ListItem key={index}>
          {typeof item === 'string' ? (
            item
          ) : (
            <>
              <strong>{item.label}</strong> {item.text}
            </>
          )}
        </ListItem>
      ))}
    </List>
  );
}

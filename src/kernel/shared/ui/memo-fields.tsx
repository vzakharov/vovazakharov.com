import type { ReactNode } from 'react';

import type { Labeled } from '@/shared/typings';

import classes from './memo-fields.module.scss';

export type MemoField = Labeled & { value: ReactNode };

type MemoFieldsProps = { fields: readonly MemoField[] };

/**
 * The `TO:` / `RE:` block a memo opens on: labels in a fixed column, values
 * wrapping beside them. A description list, so a reader without the grid still
 * gets each label paired with its value.
 */
export function MemoFields({ fields }: MemoFieldsProps) {
  return (
    <dl className={classes['fields']}>
      {fields.map(({ label, value }) => (
        <div key={label} className={classes['field']}>
          <dt className={classes['label']}>{label}:</dt>
          <dd className={classes['value']}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

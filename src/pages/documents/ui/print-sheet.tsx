import type { Routed } from '@/shared/content';
import type { WithChildren } from '@/shared/typings';

import classes from './documents.module.scss';
import { PrintedFrom } from './printed-from';

/**
 * Wraps the article so the prose clears the footer's band on every printed
 * page. The table markup is load-bearing for that reservation alone: a plain
 * element set to `display: table-footer-group` prints once, at the end, and
 * nothing out of flow holds a band open at all. Where the footer is painted is
 * `documents.module.scss`'s, which pins it to the page box rather than leaving
 * it under the prose it happens to follow.
 */
export function PrintSheet({ route, children }: Routed & WithChildren) {
  return (
    <table role="none" className={classes['printSheet']}>
      <tbody>
        <tr>
          <td>{children}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td>
            <PrintedFrom {...{ route }} />
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

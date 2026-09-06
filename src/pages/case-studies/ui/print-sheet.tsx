import type { Routed } from '@/shared/content';
import type { WithChildren } from '@/shared/typings';

import classes from './case-studies.module.scss';
import { PrintedFrom } from './printed-from';

/**
 * Wraps the article so its footer repeats at the foot of every printed page.
 * Only a real `<tfoot>` does that in Chromium, and it is the one mechanism that
 * also keeps the flow clear of the footer's height: `position: fixed` repeats
 * but lets the text run underneath, and `display: table-footer-group` on a
 * plain element prints once, at the end.
 *
 * The table is presentational, and lays out as the blocks it wraps on screen.
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

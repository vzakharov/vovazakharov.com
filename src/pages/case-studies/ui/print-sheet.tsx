import type { Routed } from '@/shared/content';
import type { WithChildren } from '@/shared/typings';

import classes from './case-studies.module.scss';
import { PrintedFrom } from './printed-from';

/**
 * Wraps the article so its footer repeats at the foot of every printed page.
 * The table markup is load-bearing: only a real `<tfoot>` both repeats per page
 * and keeps the flow clear of its height — `position: fixed` lets the text run
 * underneath, and `display: table-footer-group` on a plain element prints once.
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

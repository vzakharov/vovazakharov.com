import type { Routed } from '@/shared/content';
import type { WithChildren } from '@/shared/typings';

import classes from './documents.module.scss';
import { PrintedFrom } from './printed-from';

/**
 * Wraps the article in the presentational table whose `<tfoot>` reserves the
 * footer's band on every printed page. Only a real `<tfoot>` does: a plain
 * element set to `display: table-footer-group` prints once, at the end. The
 * footer is painted into that band out of flow, by `documents.module.scss`.
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

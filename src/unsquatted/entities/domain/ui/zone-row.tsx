import type { Row } from '../lib/rows';
import {
  type CopiedPrice,
  type CopiedVerdict,
  UncheckedLabel,
  VerdictLabel,
} from './verdict-label';
import classes from './zone-row.module.scss';

type ZoneRowProps = CopiedVerdict &
  CopiedPrice &
  Row & { ownNeighbour: boolean };

export function ZoneRow({
  domain,
  checkable,
  verdict,
  ownNeighbour,
  price,
  copy,
}: ZoneRowProps) {
  return (
    <li className={classes['zone']}>
      <span className={classes['domain']} title={domain}>
        {domain}
      </span>
      {checkable ? (
        <VerdictLabel {...{ domain, verdict, ownNeighbour, price, copy }} />
      ) : (
        <UncheckedLabel text={copy.cantCheck} />
      )}
    </li>
  );
}

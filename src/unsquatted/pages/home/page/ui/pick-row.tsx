'use client';

import { cx } from '@/kernel/shared/lib/class-names';

import { TextLink } from '@/shell/shared/ui';

import { labelOf, useChecker, zoneOf } from '../../checker';
import { CornerTools, toolHolder } from '../../corner-tools';
import { useVerdict } from '../../verdict';
import { registerUrl } from '../lib/register';
import type { ShownName } from '../model/picks';
import classes from './unsquatted-home.module.scss';
import { type CopiedPrice, PriceHint } from './verdict-label';

type PickRowProps = ShownName & CopiedPrice;

/**
 * A listed name, looked up again on every visit: one taken since it was
 * listed loses its register link and says so, rather than sending a visitor
 * to a registrar to find out.
 */
export function PickRow({
  domain,
  category,
  blurb,
  price,
  copy,
}: PickRowProps) {
  // A listed name's card lists it alone, so its own price is all it needs.
  const prices = { [zoneOf(domain)]: price };
  const verdict = useVerdict(domain);
  const taken = verdict?.state === 'taken';
  const { checkNow } = useChecker();
  const name = labelOf(domain);
  const verdicts = new Map(verdict === undefined ? [] : [[domain, verdict]]);

  return (
    <li className={cx(classes['pick'], toolHolder)} data-taken={taken}>
      {/* The name alone, without its zone, so the checker tries it in all. */}
      <button
        type="button"
        className={classes['domain']}
        onClick={() => {
          checkNow(name);
        }}
      >
        {domain}
      </button>
      <span className={classes['category']}>{category}</span>
      <p className={classes['blurb']}>{blurb}</p>
      <span className={classes['register']}>
        {taken ? (
          copy.verdict.taken
        ) : (
          <>
            <span className={classes['registerLine']}>
              <CornerTools
                siblings={[]}
                {...{ domain, name, verdicts, prices, copy }}
              />
              <TextLink href={registerUrl(domain)}>{copy.register}</TextLink>
            </span>
            {price !== undefined && <PriceHint {...{ price, copy }} />}
          </>
        )}
      </span>
    </li>
  );
}

'use client';

import { TextLink } from '@/shell/shared/ui';

import { labelOf, useChecker } from '../../checker';
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
  const verdict = useVerdict(domain);
  const taken = verdict?.state === 'taken';
  const { checkNow } = useChecker();
  const name = labelOf(domain);

  return (
    <li className={classes['pick']} data-taken={taken}>
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
            <TextLink href={registerUrl(domain)}>{copy.register}</TextLink>
            {price !== undefined && <PriceHint {...{ price, copy }} />}
          </>
        )}
      </span>
    </li>
  );
}

'use client';

import { TextLink } from '@/shell/shared/ui';

import type { WithCopy } from '../i18n';
import { registerUrl } from '../lib/register';
import { useVerdict } from '../lib/use-verdict';
import type { ShownName } from '../model/picks';
import { useChecker } from './checker-state';
import classes from './unsquatted-home.module.scss';

type PickRowProps = ShownName & WithCopy;

/**
 * A listed name, looked up again on every visit: one taken since it was
 * listed loses its register link and says so, rather than sending a visitor
 * to a registrar to find out.
 */
export function PickRow({ domain, category, blurb, copy }: PickRowProps) {
  const taken = useVerdict(domain)?.state === 'taken';
  const { checkNow } = useChecker();

  return (
    <li className={classes['pick']} data-taken={taken}>
      {/* The name alone, without its zone, so the checker tries it in all. */}
      <button
        type="button"
        className={classes['domain']}
        onClick={() => {
          checkNow(domain.slice(0, domain.indexOf('.')));
        }}
      >
        {domain}
      </button>
      <span className={classes['category']}>{category}</span>
      <p className={classes['blurb']}>{blurb}</p>
      <span className={classes['register']}>
        {taken ? (
          copy.taken
        ) : (
          <TextLink href={registerUrl(domain)}>{copy.register}</TextLink>
        )}
      </span>
    </li>
  );
}

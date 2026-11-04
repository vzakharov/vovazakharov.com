'use client';

import { TextLink } from '@/shell/shared/ui';

import { labelOf, useChecker, zoneOf } from '../../checker';
import { LikeButton } from '../../likes';
import type { ShownName } from '../../picks';
import { useVerdict } from '../../verdict';
import { type CopiedPrice, PriceHint, registerUrl } from '../../verdict-label';
import classes from './deck.module.scss';

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
    <li className={classes['pick']} data-taken={taken} data-domain={domain}>
      <span className={classes['pickName']}>
        {/*
          The name as it reads, its dot dropped — `firk.in` as `firkin` — so
          the checker sets the word's `.com` beside the hack it splits into.
        */}
        <button
          type="button"
          className={classes['domain']}
          onClick={() => {
            checkNow(domain.replace(/\.com$/, '').replace('.', ''));
          }}
        >
          {domain}
        </button>
        <LikeButton
          variant="subtle"
          size="sm"
          className={classes['pickLike']}
          zone={zoneOf(domain)}
          iconSize={16}
          {...{ name, copy }}
        />
      </span>
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

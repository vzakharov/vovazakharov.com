import { TextLink } from '@/shell/shared/ui';

import type { Verdict, WithDomain } from '../lib/lookup';
import { registerUrl } from '../lib/register';
import classes from './unsquatted-home.module.scss';

type VerdictLabelProps = WithDomain & {
  /** `undefined` while the lookup runs. */
  verdict: Verdict | undefined;
  /** Shown beside the site's own domain, so teased about what it says. */
  ownNeighbour?: boolean;
  /** What registering costs, shown where it is free or may be. */
  price?: string | undefined;
};

/** The site's own domain, which a visitor checking it is teased about. */
export const OWN_DOMAIN = 'unsquatted.com';

function takenText(domain: string, verdict: Verdict | undefined): string {
  if (domain === OWN_DOMAIN) return 'seriously?';
  if (verdict?.state !== 'taken') return 'taken';

  const { since, expiring } = verdict;
  const taken = since === undefined ? 'taken' : `taken ${since}`;

  return expiring === undefined ? taken : `${taken}, ${expiring}`;
}

/** The aside under the site's own name in its neighbouring zone. */
function neighbourAside(state: string): string | undefined {
  if (state === 'free' || state === 'maybe') {
    return '(but that wouldn’t be very nice)';
  }
  if (state === 'taken') return '(can you imagine someone did that to us?)';

  return undefined;
}

/** One zone's answer, a link to register it where it is free or may be. */
export function VerdictLabel({
  domain,
  verdict,
  ownNeighbour = false,
  price,
}: VerdictLabelProps) {
  const state = verdict?.state ?? 'pending';
  const text = {
    pending: 'checking…',
    free: 'available →',
    maybe: 'may be available →',
    taken: takenText(domain, verdict),
    unknown: 'no answer',
  }[state];
  const aside = ownNeighbour ? neighbourAside(state) : undefined;
  const registrable = state === 'free' || state === 'maybe';

  return (
    <>
      <span className={classes['verdict']} data-state={state}>
        {registrable ? (
          <TextLink href={registerUrl(domain)}>{text}</TextLink>
        ) : (
          text
        )}
      </span>
      {registrable && price !== undefined && (
        <span className={classes['price']}>{price}</span>
      )}
      {aside !== undefined && <span className={classes['aside']}>{aside}</span>}
    </>
  );
}

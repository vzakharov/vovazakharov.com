import { TextLink } from '@/shell/shared/ui';

import type { Verdict, WithDomain } from '../lib/lookup';
import { type Price, priceParts } from '../lib/prices';
import { registerUrl } from '../lib/register';
import classes from './unsquatted-home.module.scss';

type VerdictLabelProps = WithDomain & {
  /** `undefined` while the lookup runs. */
  verdict: Verdict | undefined;
  /** Shown beside the site's own domain, so teased about what it says. */
  ownNeighbour?: boolean;
  /** What registering costs, shown where it is free or may be. */
  price?: Price | undefined;
};

/** The site's own domain, which a visitor checking it is teased about. */
export const OWN_DOMAIN = 'unsquatted.com';

function takenText(domain: string, verdict: Verdict | undefined): string {
  if (domain === OWN_DOMAIN) return 'seriously?';
  if (verdict?.state !== 'taken') return 'taken';

  const { since, frees } = verdict;
  const taken = since === undefined ? 'taken' : `taken ${since}`;

  return frees === undefined ? taken : `${taken}, ${frees}`;
}

type State = Verdict['state'] | 'pending';

const isRegistrable = (state: State) => state === 'free' || state === 'maybe';

/** The aside under the site's own name in its neighbouring zone. */
function neighbourAside(state: State): string | undefined {
  if (isRegistrable(state)) return '(but that wouldn’t be very nice)';
  if (state === 'taken') return '(can you imagine someone did that to us?)';

  return undefined;
}

type PriceHintProps = { price: Price };

/** The amounts at the hint's weight, the words between them quieter still. */
function PriceHint({ price }: PriceHintProps) {
  const { first, after } = priceParts(price);
  const filler = (words: string) => (
    <span className={classes['priceFiller']}>{words}</span>
  );

  return (
    <span className={classes['price']}>
      {`$${first}`}
      {after !== undefined && (
        <>
          {filler(', then ')}
          {`$${after}`}
        </>
      )}
      {filler('/yr')}
    </span>
  );
}

/** One zone's answer, a link to register it where it is free or may be. */
export function VerdictLabel({
  domain,
  verdict,
  ownNeighbour = false,
  price,
}: VerdictLabelProps) {
  const state: State = verdict?.state ?? 'pending';
  const text = {
    pending: 'checking…',
    free: 'available →',
    maybe: 'may be available →',
    taken: takenText(domain, verdict),
    unknown: 'no answer',
  }[state];
  const aside = ownNeighbour ? neighbourAside(state) : undefined;
  const registrable = isRegistrable(state);

  return (
    <>
      <span className={classes['verdict']} data-state={state}>
        {registrable ? (
          <TextLink href={registerUrl(domain)}>{text}</TextLink>
        ) : (
          text
        )}
      </span>
      {registrable && price !== undefined && <PriceHint {...{ price }} />}
      {aside !== undefined && <span className={classes['aside']}>{aside}</span>}
    </>
  );
}

import { TextLink } from '@/shell/shared/ui';

import type { WithCopy } from '../i18n';
import type { Release, Verdict, WithDomain } from '../lib/lookup';
import { type Price, priceParts } from '../lib/prices';
import { registerUrl } from '../lib/register';
import classes from './unsquatted-home.module.scss';

type VerdictLabelProps = WithCopy &
  WithDomain & {
    /** `undefined` while the lookup runs. */
    verdict: Verdict | undefined;
    /** Shown beside the site's own domain, so teased about what it says. */
    ownNeighbour?: boolean;
    /** What registering costs, shown where it is free or may be. */
    price?: Price | undefined;
  };

/** The site's own domain, which a visitor checking it is teased about. */
export const OWN_DOMAIN = 'unsquatted.com';

type Copy = WithCopy['copy'];

function releaseText({ release, units }: Copy, frees: Release): string {
  if (frees === 'soon' || frees === 'now') return release[frees];

  const { left, unit } = frees;

  return release.in
    .replace('{left}', String(left))
    .replace('{unit}', units[unit][left === 1 ? 'one' : 'other']);
}

function takenText(
  copy: Copy,
  domain: string,
  verdict: Verdict | undefined,
): string {
  if (domain === OWN_DOMAIN) return copy.verdict.own;
  if (verdict?.state !== 'taken') return copy.verdict.taken;

  const { since, frees } = verdict;
  const taken =
    since === undefined
      ? copy.verdict.taken
      : copy.verdict.takenSince.replace('{year}', since);

  return frees === undefined ? taken : `${taken}, ${releaseText(copy, frees)}`;
}

type State = Verdict['state'] | 'pending';

const isRegistrable = (state: State) => state === 'free' || state === 'maybe';

/** The aside under the site's own name in its neighbouring zone. */
function neighbourAside({ neighbour }: Copy, state: State): string | undefined {
  if (isRegistrable(state)) return neighbour.registrable;
  if (state === 'taken') return neighbour.taken;

  return undefined;
}

type PriceHintProps = WithCopy & { price: Price };

/** The amounts at the hint's weight, the words between them quieter still. */
export function PriceHint({ price, copy }: PriceHintProps) {
  const { first, after } = priceParts(price);
  const filler = (words: string) => (
    <span className={classes['priceFiller']}>{words}</span>
  );

  return (
    <span className={classes['price']}>
      {`$${first}`}
      {after !== undefined && (
        <>
          {filler(copy.price.then)}
          {`$${after}`}
        </>
      )}
      {filler(copy.price.perYear)}
    </span>
  );
}

/** One zone's answer, a link to register it where it is free or may be. */
export function VerdictLabel({
  domain,
  verdict,
  ownNeighbour = false,
  price,
  copy,
}: VerdictLabelProps) {
  const state: State = verdict?.state ?? 'pending';
  const text =
    state === 'taken' ? takenText(copy, domain, verdict) : copy.verdict[state];
  const aside = ownNeighbour ? neighbourAside(copy, state) : undefined;
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
      {registrable && price !== undefined && <PriceHint {...{ price, copy }} />}
      {aside !== undefined && <span className={classes['aside']}>{aside}</span>}
    </>
  );
}

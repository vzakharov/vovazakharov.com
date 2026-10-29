import { TextLink } from '@/shell/shared/ui';

import type { Verdict, WithDomain } from '../lib/lookup';
import { registerUrl } from '../lib/register';
import classes from './unsquatted-home.module.scss';

type VerdictLabelProps = WithDomain & {
  /** `undefined` while the lookup runs. */
  verdict: Verdict | undefined;
  /** Shown beside the site's own domain, so teased about what it says. */
  ownNeighbour?: boolean;
};

/** The site's own domain, which a visitor checking it is teased about. */
export const OWN_DOMAIN = 'unsquatted.com';

function takenText(domain: string, since: string | undefined): string {
  if (domain === OWN_DOMAIN) return 'seriously?';

  return since === undefined ? 'taken' : `taken ${since}`;
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
}: VerdictLabelProps) {
  const state = verdict?.state ?? 'pending';
  const text = {
    pending: 'checking…',
    free: 'available →',
    maybe: 'may be available →',
    taken: takenText(
      domain,
      verdict?.state === 'taken' ? verdict.since : undefined,
    ),
    unknown: 'no answer',
  }[state];
  const aside = ownNeighbour ? neighbourAside(state) : undefined;

  return (
    <>
      <span className={classes['verdict']} data-state={state}>
        {state === 'free' || state === 'maybe' ? (
          <TextLink href={registerUrl(domain)}>{text}</TextLink>
        ) : (
          text
        )}
      </span>
      {aside !== undefined && <span className={classes['aside']}>{aside}</span>}
    </>
  );
}

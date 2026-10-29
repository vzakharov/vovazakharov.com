import { TextLink } from '@/shell/shared/ui';

import type { Verdict, WithDomain } from '../lib/lookup';
import { registerUrl } from '../lib/register';
import classes from './unsquatted-home.module.scss';

type VerdictLabelProps = WithDomain & {
  /** `undefined` while the lookup runs. */
  verdict: Verdict | undefined;
};

/** The site's own name, which a visitor checking it is teased about. */
const OWN_LABEL = 'unsquatted';

function takenText(domain: string, since: string | undefined): string {
  if (domain.split('.')[0] === OWN_LABEL) return 'seriously?';

  return since === undefined ? 'taken' : `taken ${since}`;
}

/** One zone's answer, a link to register it where it is free or may be. */
export function VerdictLabel({ domain, verdict }: VerdictLabelProps) {
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

  return (
    <span className={classes['verdict']} data-state={state}>
      {state === 'free' || state === 'maybe' ? (
        <TextLink href={registerUrl(domain)}>{text}</TextLink>
      ) : (
        text
      )}
    </span>
  );
}

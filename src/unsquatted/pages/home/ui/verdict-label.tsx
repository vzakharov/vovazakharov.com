import { TextLink } from '@/shell/shared/ui';

import type { Verdict, WithDomain } from '../lib/lookup';
import { registerUrl } from '../lib/register';
import classes from './unsquatted-home.module.scss';

type VerdictLabelProps = WithDomain & {
  /** `undefined` while the lookup runs. */
  verdict: Verdict | undefined;
};

/** One zone's answer, a link to register it where it is free or may be. */
export function VerdictLabel({ domain, verdict }: VerdictLabelProps) {
  const state = verdict?.state ?? 'pending';
  const text = {
    pending: 'checking…',
    free: 'free →',
    maybe: 'probably free →',
    taken:
      verdict?.state === 'taken' && verdict.since !== undefined
        ? `taken ${verdict.since}`
        : 'taken',
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

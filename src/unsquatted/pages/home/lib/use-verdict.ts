'use client';

import { useEffect, useState } from 'react';

import { checkDomain } from './check-domain';
import type { Verdict } from './lookup';

type Answers = { ask: string; verdicts: ReadonlyMap<string, Verdict> };

const NONE: ReadonlyMap<string, Verdict> = new Map();

/**
 * The verdicts in on `domains`, a domain missing while it is being looked up.
 * A new `round` looks the same domains up again. A lookup that throws — a
 * resolver down, a body of the wrong shape — is the visitor's "no answer", and
 * is reported to the page's error handlers as any uncaught error is.
 */
export function useVerdicts(
  domains: readonly string[],
  round = 0,
): ReadonlyMap<string, Verdict> {
  const ask = `${round} ${domains.join(' ')}`;
  const [answers, setAnswers] = useState<Answers>({ ask: '', verdicts: NONE });

  useEffect(() => {
    const stale = new AbortController();

    const asked = ask.split(' ').slice(1);

    for (const domain of asked.filter((each) => each !== '')) {
      const settle = (verdict: Verdict) => {
        if (stale.signal.aborted) return;
        setAnswers((before) => ({
          ask,
          verdicts: new Map(before.ask === ask ? before.verdicts : NONE).set(
            domain,
            verdict,
          ),
        }));
      };

      checkDomain(domain).then(settle, (error: unknown) => {
        settle({ state: 'unknown' });
        reportError(error);
      });
    }

    return () => {
      stale.abort();
    };
  }, [ask]);

  return answers.ask === ask ? answers.verdicts : NONE;
}

/** `domain`'s verdict, `undefined` while it is being looked up. */
export function useVerdict(domain: string): Verdict | undefined {
  return useVerdicts([domain]).get(domain);
}

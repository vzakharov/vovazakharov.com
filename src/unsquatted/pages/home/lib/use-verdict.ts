'use client';

import { useEffect, useState } from 'react';

import { checkDomain } from './check-domain';
import type { Verdict, WithDomain } from './lookup';

type Answer = WithDomain & { verdict: Verdict };

/**
 * `domain`'s verdict, `undefined` while it is being looked up. A lookup that
 * throws — a resolver down, a body of the wrong shape — is the visitor's "no
 * answer", and is reported to the page's error handlers as any uncaught error
 * is.
 */
export function useVerdict(domain: string): Verdict | undefined {
  const [answer, setAnswer] = useState<Answer>();

  useEffect(() => {
    let current = true;
    const settle = (verdict: Verdict) => {
      if (current) setAnswer({ domain, verdict });
    };

    checkDomain(domain).then(settle, (error: unknown) => {
      settle({ state: 'unknown' });
      reportError(error);
    });

    return () => {
      current = false;
    };
  }, [domain]);

  return answer?.domain === domain ? answer.verdict : undefined;
}

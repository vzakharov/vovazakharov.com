import { type Context, use } from 'react';

import type { Named } from '../typings';
import { errorClass } from './error-class';

const MissingProviderError = errorClass('MissingProviderError');

/**
 * `context`'s value, throwing where `provider` — the component that provides
 * it, named in the error for its absence — is not above the caller: a context
 * whose default is `undefined` has nothing to render without one.
 */
export function useProvided<T>(
  context: Context<T | undefined>,
  provider: Named,
): T {
  const value = use(context);

  if (value === undefined) {
    throw new MissingProviderError(`${provider.name} is not above this one`);
  }

  return value;
}

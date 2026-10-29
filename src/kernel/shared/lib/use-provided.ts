import { type Context, use } from 'react';

import { errorClass } from './error-class';

const MissingProviderError = errorClass('MissingProviderError');

/** The component that provides a context, named in the error for its absence. */
type Provider = { name: string };

/**
 * `context`'s value, throwing where `provider` is not above the caller: a
 * context whose default is `undefined` has nothing to render without one.
 */
export function useProvided<T>(
  context: Context<T | undefined>,
  provider: Provider,
): T {
  const value = use(context);

  if (value === undefined) {
    throw new MissingProviderError(`${provider.name} is not above this one`);
  }

  return value;
}

/**
 * An `Error` subclass reporting itself as `name`, for a failure worth telling
 * apart by what failed: `const PricingError = errorClass('PricingError')`.
 */
export function errorClass(name: string) {
  return class extends Error {
    constructor(message: string, options?: ErrorOptions) {
      super(message, options);
      this.name = name;
    }
  };
}

const NonErrorThrown = errorClass('NonErrorThrown');

/** What a `catch` caught, as an `Error`: a thrown non-`Error` is wrapped, kept as the cause. */
export function asError(caught: unknown): Error {
  return caught instanceof Error
    ? caught
    : new NonErrorThrown(String(caught), { cause: caught });
}

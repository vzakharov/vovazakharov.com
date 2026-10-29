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

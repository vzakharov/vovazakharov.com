// The TS target is ES2017, which has no `1n` literals.

export const big: (value: number) => bigint = BigInt;

export const ZERO = big(0);
export const ONE = big(1);

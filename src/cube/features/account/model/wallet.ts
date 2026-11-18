import { z } from 'zod';

import type { Holdings, InRoom, SignMount } from '@/cube/entities/world';

/** What a player holds: their кубики, and the rooms they bought with them. */
export type Wallet = { balance: number; holdings: Holdings };

export const EMPTY_WALLET: Wallet = { balance: 0, holdings: new Map() };

const inRoomSchema = z.object({
  u: z.number(),
  v: z.number(),
}) satisfies z.ZodType<InRoom>;

const mountSchema = z.object({
  at: inRoomSchema,
  facing: inRoomSchema,
  onPost: z.boolean(),
}) satisfies z.ZodType<SignMount>;

const cubes = z.number().int().nonnegative();

const storedSchema = z.object({
  balance: cubes,
  holdings: z.array(z.tuple([z.string(), mountSchema])),
});

/** `wallet` as text to store. */
export const serialized = ({ balance, holdings }: Wallet): string =>
  JSON.stringify({ balance, holdings: [...holdings] });

/** The wallet `text` stores; throws, naming the fault, on text that is none. */
export function parsed(text: string): Wallet {
  const result = storedSchema.safeParse(JSON.parse(text));
  if (!result.success) {
    throw new Error(`A stored wallet is unreadable: ${z.prettifyError(result.error)}`);
  }
  return { ...result.data, holdings: new Map(result.data.holdings) };
}

const gift = cubes.positive();

/** `value` as a count of кубики to give: whole and above zero, or it throws. */
export function giftOf(value: unknown): number {
  const result = gift.safeParse(value);
  if (!result.success) {
    throw new RangeError(`Not a count of кубики to give: ${String(value)}`);
  }
  return result.data;
}

/** `wallet` with `count` more кубики, a whole count above zero. */
export const credited = (wallet: Wallet, count: number): Wallet => ({
  ...wallet,
  balance: wallet.balance + giftOf(count),
});

/**
 * `wallet` with the room `key` bought for `price`, its sign at `mount`.
 * Throws where the balance falls short or the room is already held: the
 * caller offers neither.
 */
export function withRoom(
  wallet: Wallet,
  key: string,
  mount: SignMount,
  price: number,
): Wallet {
  if (wallet.balance < price) {
    throw new RangeError(`${price} кубики asked, ${wallet.balance} held`);
  }
  if (wallet.holdings.has(key)) throw new Error(`Room ${key} is already held`);
  return {
    balance: wallet.balance - price,
    holdings: new Map([...wallet.holdings, [key, mount]]),
  };
}

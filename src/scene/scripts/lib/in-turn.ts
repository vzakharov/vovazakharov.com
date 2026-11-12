/** Runs `each` over `items` one after another, as steps on one page must. */
export async function inTurn<Item>(
  items: readonly Item[],
  each: (item: Item) => Promise<void>,
): Promise<void> {
  const [first, ...rest] = items;
  if (first === undefined) return;
  await each(first);
  return inTurn(rest, each);
}

/** Runs `each` `count` times one after another, handing it 0 to `count - 1`. */
export const timesInTurn = async (
  count: number,
  each: (index: number) => Promise<void>,
): Promise<void> => inTurn([...Array.from({ length: count }).keys()], each);

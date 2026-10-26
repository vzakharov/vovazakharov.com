/**
 * How a part of the scene reads the meadow and acts on it, generic in how
 * much of the meadow it reads and which actions it sends, so each part names
 * only its own slice and the scene hands every one the whole.
 */

import type { View } from './view';

/** What sends actions of kind `A` to the reducer. */
export type Dispatching<A> = { dispatch: (action: A) => void };

/** What reads the meadow as it stands, `M` being as much of it as is read: none before it is first laid. */
export type MeadowSeen<M> = { meadow: () => M | undefined };

/** What reads the stand `S` the scene stands the meadow on, and the view it is shown in. */
export type StandSeen<S> = {
  stand: () => S | undefined;
  view: () => View | undefined;
};

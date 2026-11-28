import type { Seeded } from '@/kernel/shared/typings';

import type { Place } from './ink';

/** A drawn figure: where it goes, and the seed that sets its boil and its quirks. */
export type Figure = Place & Partial<Seeded>;

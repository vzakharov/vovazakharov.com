import 'server-only';

import { z } from 'zod';

import { routing } from './routing';

/**
 * Reachable only through `index.server-only.ts`: zod is ~90 kB gzipped, and a
 * client component that pulled this in through the segment's ordinary barrel
 * would ship all of it to validate a segment `generateStaticParams` already
 * enumerated. The `server-only` import above is what turns that into a build
 * error.
 */
export const localeSchema = z.enum(routing.locales);

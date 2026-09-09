import 'server-only';

import { z } from 'zod';

import { routing } from './routing';

/**
 * Kept out of `index.ts` and behind `server-only`: zod is ~90 kB gzipped, and
 * nothing on the CDN re-validates a segment `generateStaticParams` enumerated.
 */
export const localeSchema = z.enum(routing.locales);

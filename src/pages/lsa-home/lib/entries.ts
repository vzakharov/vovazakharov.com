import type { Linked } from '@/shared/typings';
import type { Summarized } from '@/shared/ui';

/**
 * What the site has published, newest first. Off-site for now — the pieces run
 * elsewhere and are listed here — so each carries its own URL rather than a
 * route this app serves.
 */
export const ENTRIES: Array<Summarized & Linked> = [];

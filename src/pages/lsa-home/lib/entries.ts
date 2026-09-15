import type { Linked } from '@/shared/typings';
import type { Summarized } from '@/shared/ui';

/**
 * What the site has published, newest first. Each carries its own URL: a piece
 * runs where it runs, and the index links to it.
 */
export const ENTRIES: Array<Summarized & Linked> = [];

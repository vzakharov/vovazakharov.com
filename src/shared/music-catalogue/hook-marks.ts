import type { WithText } from '@/shared/typings';

export type HookRun = WithText & { struck?: true };

/**
 * `~~words~~` is the one mark a hook takes: words meant to be read crossed out,
 * as GitHub sets them.
 */
const STRUCK = /~~(?=\S)(.+?)(?<=\S)~~/gu;

/** A hook cut where its struck words begin and end. */
export function hookRuns(hook: string): HookRun[] {
  return hook
    .split(STRUCK)
    .flatMap<HookRun>((text, index) =>
      text === '' ? [] : [index % 2 === 1 ? { text, struck: true } : { text }],
    );
}

/**
 * A hook where no mark can be drawn — a meta description, a feed — the struck
 * words kept as words.
 */
export function plainHook(hook: string): string {
  return hook.replaceAll(STRUCK, '$1');
}

import type { WithText } from '@/kernel/shared/typings';

/**
 * A run, in the typesetter's sense: a stretch of a hook set all one way, struck
 * through or plain. A hook is the sequence of its runs.
 */
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

/** U+0336, which draws a line through the character before it. */
const COMBINING_STROKE = '̶';

/** Graphemes, so the stroke lands after a whole `й` or emoji, never inside one. */
const GRAPHEMES = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

/**
 * A hook as plain text — a meta description, a feed — the struck words drawn
 * through with a combining stroke, the joke being in seeing them crossed out.
 */
export function textHook(hook: string): string {
  return hook.replaceAll(STRUCK, (_, words: string) =>
    Array.from(
      GRAPHEMES.segment(words),
      ({ segment }) => segment + COMBINING_STROKE,
    ).join(''),
  );
}

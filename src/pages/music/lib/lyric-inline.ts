import type { WithText } from '@/shared/typings';

/** A stretch of a line set one way: in italics, or not. */
export type InlineRun = WithText & { emphasis?: true };

const ESCAPE = /\\([!-/:-@[-`{-~])/g;

/**
 * The two inline marks a line of verse takes. A backslash before ASCII
 * punctuation is how markdown — and Prettier, formatting the file — writes it
 * literally; the page sets the words as text, so it drops the escape GitHub
 * would have consumed. `_words_` is a word sung in another script and written
 * in this one's letters — _Poekhali!_ — set in italics as GitHub sets it. An
 * underscore inside a word marks nothing, as on GitHub.
 */
const INLINE_MARK = new RegExp(
  String.raw`${ESCAPE.source}|(?<![\p{L}\p{N}_])_(?=\S)((?:\\.|[^\\])+?)(?<=\S)_(?![\p{L}\p{N}_])`,
  'gu',
);

function unescaped(text: string): string {
  return text.replaceAll(ESCAPE, '$1');
}

/** A line's text, cut where its italics begin and end, escapes dropped. */
export function inlineRuns(text: string): InlineRun[] {
  const runs: InlineRun[] = [];
  let plain = '';

  function flush(): void {
    if (plain !== '') runs.push({ text: plain });
    plain = '';
  }

  let from = 0;

  for (const { 0: mark, 1: escaped, 2: italic, index } of text.matchAll(
    INLINE_MARK,
  )) {
    plain += text.slice(from, index);
    from = index + mark.length;

    if (escaped !== undefined) {
      plain += escaped;
      continue;
    }

    flush();
    runs.push({ text: unescaped(italic ?? ''), emphasis: true });
  }

  plain += text.slice(from);
  flush();

  return runs;
}

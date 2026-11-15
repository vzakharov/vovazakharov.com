export type Run =
  | { kind: 'text'; text: string }
  | { kind: 'link'; href: string };

const URL = /https?:\/\/\S+/g;

/** Punctuation a sentence puts after a URL rather than the URL's own. */
const TRAILING = /[!"',.:;?»’”]+$/;

const count = (text: string, char: string): number =>
  text.split(char).length - 1;

/**
 * A closing bracket ends the URL unless the URL opened it — a Wikipedia
 * `…_(film)` keeps its own, a URL written `(like https://x.y)` gives it back.
 */
function trimmed(url: string): string {
  let end = url.replace(TRAILING, '');
  while (end.endsWith(')') && count(end, ')') > count(end, '(')) {
    end = end.slice(0, -1).replace(TRAILING, '');
  }
  return end;
}

/**
 * `text` as alternating text and link runs, which joined back give `text`
 * exactly, so a node built from them edits as the plain text it came from.
 */
export function linkRuns(text: string): Run[] {
  const runs: Run[] = [];
  let at = 0;
  for (const match of text.matchAll(URL)) {
    const href = trimmed(match[0]);
    if (!/^https?:\/\/[^/]/.test(href)) continue;
    if (match.index > at)
      runs.push({ kind: 'text', text: text.slice(at, match.index) });
    runs.push({ kind: 'link', href });
    at = match.index + href.length;
  }
  if (at < text.length) runs.push({ kind: 'text', text: text.slice(at) });
  return runs;
}

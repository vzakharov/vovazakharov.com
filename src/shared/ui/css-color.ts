/**
 * The site's colour tokens, declared in `src/app/styles/globals.css` as
 * `--color-*` properties and redeclared there for the dark scheme, so call
 * sites never branch on the scheme. A token missing from this union is a type
 * error rather than a silently dead `var()`.
 */
export type CssColor =
  | 'background'
  | 'foreground'
  | 'border-hairline'
  | 'border-hairline-strong';

export function cssColor(color: CssColor) {
  return `var(--color-${color})`;
}

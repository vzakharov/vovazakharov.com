import type { Suffixed } from '@/shared/typings';

/**
 * The site's colour tokens, declared in `src/app/styles/globals.scss` as
 * `--color-*` properties and redeclared there for the dark scheme, so call
 * sites never branch on the scheme. A token missing from this union is a type
 * error rather than a silently dead `var()`.
 */
export type CssColor =
  | 'background'
  | 'foreground'
  | Suffixed<'border-hairline', '' | 'strong'>;

export function cssColor(
  color: CssColor
): `var(--${Suffixed<'color', CssColor>})` {
  return `var(--color-${color})`;
}

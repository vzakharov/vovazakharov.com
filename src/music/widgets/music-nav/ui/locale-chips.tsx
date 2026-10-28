import type { Locale, WithLocale } from '@/kernel/shared/i18n';
import { pick } from '@/kernel/shared/lib/collections';

import { ChipNav, localeChips } from '@/shell/shared/ui';

import { messages } from '@/music/shared/i18n';

import { ScriptChip } from './script-chip';

export type LocaleChipsProps = WithLocale & {
  /** Where this same page is served in each language. */
  hrefs: Record<Locale, string>;
  /**
   * The sample of the script the page's names are in where the locale gets
   * them in Latin, from `scriptSample`: it makes the current chip the switch.
   */
  sample?: string | undefined;
};

/**
 * The switch between a page's two languages, and on a page with names in
 * another script, between their two spellings. A server component, unlike the
 * CV's: a music page's locale is a segment of its own route, so it is known
 * without asking the client which language it is in.
 */
export function LocaleChips({ locale, hrefs, sample }: LocaleChipsProps) {
  const chips = localeChips(locale, (alternate) => hrefs[alternate]);

  return (
    <ChipNav
      {...{ chips }}
      current={
        sample === undefined ? undefined : (
          <ScriptChip
            label={locale.toUpperCase()}
            {...{ sample }}
            {...pick(messages(locale), 'originalScript')}
          />
        )
      }
    />
  );
}

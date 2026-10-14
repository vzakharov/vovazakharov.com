import {
  loadMessages,
  type Locale,
  LOCALES,
  type WithLocale,
} from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';
import { type Chip, ChipNav } from '@/shared/ui';

import {
  OnAirScriptChip,
  type OnAirScriptChipProps,
} from './on-air-script-chip';
import { ScriptChip } from './script-chip';

type ScriptSamples = {
  /**
   * The sample of the script the page's names are in where the locale gets
   * them in Latin, from `scriptSample`: it makes the current chip the switch.
   */
  sample?: string | undefined;
  /**
   * The radio's stand-in for `sample`, which only the browser can pick: one
   * per song it may play, the chip following whichever is on air.
   */
  onAirSamples?: OnAirScriptChipProps['samples'] | undefined;
};

export type LocaleChipsProps = WithLocale &
  ScriptSamples & {
    /** Where this same page is served in each language. */
    hrefs: Record<Locale, string>;
  };

/** What stands in for the current chip, if anything does. */
function scriptSwitch(
  { locale, sample, onAirSamples }: WithLocale & ScriptSamples,
) {
  const chip = {
    label: locale.toUpperCase(),
    ...pick(loadMessages(locale).music, 'originalScript'),
  };

  if (onAirSamples !== undefined) {
    return <OnAirScriptChip {...chip} samples={onAirSamples} />;
  }

  return sample === undefined ? undefined : (
    <ScriptChip {...chip} {...{ sample }} />
  );
}

/**
 * The switch between a page's two languages, and on a page with names in
 * another script, between their two spellings. A server component, unlike the
 * CV's: a music page's locale is a segment of its own route, so it is known
 * without asking the client which language it is in.
 */
export function LocaleChips({ locale, hrefs, ...samples }: LocaleChipsProps) {
  const chips = LOCALES.map(
    (alternate): Chip => ({
      label: alternate.toUpperCase(),
      href: hrefs[alternate],
      hrefLang: alternate,
      current: alternate === locale,
    }),
  );

  return (
    <ChipNav {...{ chips }} current={scriptSwitch({ locale, ...samples })} />
  );
}

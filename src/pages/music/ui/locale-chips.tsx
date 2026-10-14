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
import { ScriptChip, type ScriptChipProps } from './script-chip';

export type LocaleChipsProps = WithLocale &
  Pick<ScriptChipProps, 'sample'> & {
    /** Where this same page is served in each language. */
    hrefs: Record<Locale, string>;
    /**
     * The radio's stand-in for `sample`, which only the browser can pick: one
     * per song it may play, the chip following whichever is on air.
     */
    onAirSamples?: OnAirScriptChipProps['samples'] | undefined;
  };

/**
 * The switch between a page's two languages, and where the page or the
 * playing track has names in another script, between their two spellings. A
 * server component, unlike the CV's: a music page's locale is a segment of its
 * own route, so it is known without asking the client which language it is in.
 */
export function LocaleChips({
  locale,
  hrefs,
  sample,
  onAirSamples,
}: LocaleChipsProps) {
  const chips = LOCALES.map(
    (alternate): Chip => ({
      label: alternate.toUpperCase(),
      href: hrefs[alternate],
      hrefLang: alternate,
      current: alternate === locale,
    }),
  );
  const chip = {
    label: locale.toUpperCase(),
    ...pick(loadMessages(locale).music, 'originalScript'),
  };

  return (
    <ChipNav
      {...{ chips }}
      current={
        onAirSamples === undefined ? (
          <ScriptChip {...chip} {...{ sample }} />
        ) : (
          <OnAirScriptChip {...chip} samples={onAirSamples} />
        )
      }
    />
  );
}

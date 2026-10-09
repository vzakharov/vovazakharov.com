import { Group, Title } from '@mantine/core';

import type { WithLocale } from '@/shared/i18n';
import { NameLink, SUBHEADING_GAP } from '@/shared/ui';

import {
  CATALOGUE_TABS,
  tabLabels,
  tabPath,
  type WithEverything,
  type WithTab,
} from '../lib/music-urls';

export type CatalogueTabsProps = WithTab &
  WithLocale & { catalogue: WithEverything };

/**
 * The index's heading, naming what it lists, beside the other two lists it can
 * be: each tab a page of its own, so a static export serves every one.
 */
export function CatalogueTabs({ tab, catalogue, locale }: CatalogueTabsProps) {
  const labels = tabLabels(locale);

  return (
    <Group component="nav" gap={24} mt={SUBHEADING_GAP} align="baseline">
      {CATALOGUE_TABS.map((each) => (
        <Title key={each} order={3} opacity={each === tab ? 1 : 0.5}>
          {each === tab ? (
            <span aria-current="page">{labels[each]}</span>
          ) : (
            <NameLink href={tabPath(each, catalogue, locale)} c="inherit">
              {labels[each]}
            </NameLink>
          )}
        </Title>
      ))}
    </Group>
  );
}

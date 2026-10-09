import { Group } from '@mantine/core';

import { pick } from '@/shared/lib/collections';
import type { LabeledLink } from '@/shared/typings';
import { hoverDim, TextLink } from '@/shared/ui';

import { LocaleChips, type LocaleChipsProps } from './locale-chips';

export type MusicNavProps = LocaleChipsProps & {
  /** Where the page sits in the section — absent on the index, which is the top. */
  back?: LabeledLink;
};

/** The line above every music page: the way back up, and the language switch. */
export function MusicNav({ back, ...chips }: MusicNavProps) {
  return (
    <Group component="nav" justify={back ? 'space-between' : 'flex-end'}>
      {back && (
        <TextLink {...pick(back, 'href')} size="sm" className={hoverDim}>
          ← {back.label}
        </TextLink>
      )}
      <LocaleChips {...chips} />
    </Group>
  );
}

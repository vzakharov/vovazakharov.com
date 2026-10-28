import { Group } from '@mantine/core';

import { pick } from '@/kernel/shared/lib/collections';
import type { LabeledLink } from '@/kernel/shared/typings';

import { hoverDim, TextLink } from '@/shell/shared/ui';

import { LocaleChips, type LocaleChipsProps } from './locale-chips';
import classes from './music-nav.module.scss';

export type MusicNavProps = LocaleChipsProps & {
  /** Where the page sits in the section — absent on the index, which is the top. */
  back?: LabeledLink;
};

/** The line above every music page: the way back up, and the language switch. */
export function MusicNav({ back, ...chips }: MusicNavProps) {
  return (
    <Group
      component="nav"
      justify={back ? 'space-between' : 'flex-end'}
      className={classes['nav']}
    >
      {back && (
        <TextLink {...pick(back, 'href')} size="sm" className={hoverDim}>
          ← {back.label}
        </TextLink>
      )}
      <LocaleChips {...chips} />
    </Group>
  );
}

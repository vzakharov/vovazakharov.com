import { Text, Title } from '@mantine/core';
import Image from 'next/image';
import type { ReactNode } from 'react';

import { SITE_CONFIG } from '@/shared/config';
import type { Billed, TitledBlock } from '@/shared/typings';

import classes from './frontispiece.module.scss';

/** `title` names the book on its title page; `name` is whose portrait faces it. */
type FrontispieceProps = Billed &
  TitledBlock & {
    /** What the title page says the book is, under the name. */
    subtitle: string;
    /** What the portrait is, set in italics under it. */
    caption: ReactNode;
  };

/**
 * The home page's head as a book's opening spread: the portrait facing the
 * title page, captioned as a frontispiece is. Narrow, the portrait leads.
 */
export function Frontispiece({
  name,
  title,
  subtitle,
  tagline,
  caption,
  children,
}: FrontispieceProps) {
  const { path, width, height } = SITE_CONFIG.avatar;

  return (
    <header className={classes['spread']}>
      <figure className={classes['portrait']}>
        <Image
          src={path}
          {...{ width, height }}
          alt={name}
          priority
          className={classes['picture']}
        />
        <Text component="figcaption" size="sm" className={classes['caption']}>
          {caption}
        </Text>
      </figure>
      <div className={classes['titlePage']}>
        <hgroup className={classes['title']}>
          <Title order={1}>{title}</Title>
          <Text size="lg">{subtitle}</Text>
        </hgroup>
        <Text size="lg" className={classes['tagline']}>
          {tagline}
        </Text>
        {children}
      </div>
    </header>
  );
}

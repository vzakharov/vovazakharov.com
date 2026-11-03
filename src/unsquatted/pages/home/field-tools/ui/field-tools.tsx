'use client';

import { ActionIcon, Menu } from '@mantine/core';
import { Heart, ImageIcon, LinkIcon, Share2 } from 'lucide-react';
import { useState } from 'react';

import { SITE_CONFIG, withoutScheme } from '@/kernel/shared/config';
import { cx } from '@/kernel/shared/lib/class-names';
import { pick } from '@/kernel/shared/lib/collections';
import type { Typed } from '@/kernel/shared/typings';

import { useCopied } from '@/shell/shared/ui';

import type { TypedName, WithCopy } from '../../checker';
import { preferredOf, useLikes } from '../../likes';
import {
  availability,
  cardRows,
  type CardSiblings,
  domainLink,
} from '../lib/share';
import { canCopyImage, type CardText, shareCard } from '../lib/share-card';
import { CardImage } from './card-image';
import classes from './field-tools.module.scss';

/** `label` and `zone` are the name the field holds, as the checker read it. */
type FieldToolsProps = WithCopy & TypedName & CardSiblings;

type Copy = WithCopy['copy'];

/** `typed` is what the copied link opens on: the name as the field holds it. */
type ShareMenuProps = WithCopy &
  Typed & {
    /**
     * Draws the card; none while no domain of the name is known to be free.
     * The menu offers it only where the clipboard takes an image.
     */
    drawCard: (() => File) | undefined;
  };

function ShareMenu({ typed, drawCard, copy }: ShareMenuProps) {
  const [opened, setOpened] = useState(false);
  const [card, setCard] = useState<File>();
  const close = () => {
    setOpened(false);
  };
  // “Copied ✓” stands in for each menu item until the menu closes, and the
  // card copied shows beneath them.
  const link = useCopied(close);
  const image = useCopied(close);

  return (
    <Menu
      {...{ opened }}
      onChange={setOpened}
      position="bottom-end"
      shadow="md"
    >
      <Menu.Target>
        <ActionIcon
          variant="default"
          size={42}
          className={classes['tool']}
          aria-label={copy.share}
          title={copy.share}
        >
          <Share2 size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          closeMenuOnClick={false}
          leftSection={<LinkIcon size={14} />}
          onClick={() => {
            link.copy(domainLink(typed, new URL(globalThis.location.href)));
          }}
        >
          {link.copied ? copy.copied : copy.copyLink}
        </Menu.Item>
        {canCopyImage() && (
          <Menu.Item
            closeMenuOnClick={false}
            leftSection={<ImageIcon size={14} />}
            disabled={drawCard === undefined}
            onClick={() => {
              if (drawCard === undefined) return;
              const drawn = drawCard();

              setCard(drawn);
              image.copy(drawn);
            }}
          >
            {image.copied ? copy.copied : copy.copyAsImage}
          </Menu.Item>
        )}
        {image.copied && card !== undefined && <CardImage {...{ card }} />}
      </Menu.Dropdown>
    </Menu>
  );
}

const cardText = (copy: Copy): CardText => ({
  site: SITE_CONFIG.name,
  host: withoutScheme(SITE_CONFIG.url),
  footer: `${copy.lede.replace('*', '')} ${copy.cardByline}`,
  ...pick(copy, 'verdict', 'price'),
});

/**
 * The name in the field's share and heart buttons. Both are about the name as
 * a whole: the heart likes it, with the zone typed after it as the one
 * preferred, and the card leads with that zone, else the liked one, else the
 * first the lookups say is free or may be.
 */
export function FieldTools({
  label,
  zone,
  siblings,
  verdicts,
  prices,
  copy,
}: FieldToolsProps) {
  const { liked, likeFor, like, unlike } = useLikes();
  const own = likeFor(label);
  const isOn = own !== undefined;
  const typedDomain = zone === undefined ? undefined : `${label}.${zone}`;
  const preferred = own === undefined ? undefined : preferredOf(own);
  const shared = [typedDomain, preferred, ...siblings].find(
    (domain) =>
      domain !== undefined && availability(verdicts.get(domain)) !== undefined,
  );

  return (
    <>
      <ShareMenu
        typed={typedDomain ?? label}
        drawCard={
          shared === undefined
            ? undefined
            : () =>
                shareCard(
                  label,
                  cardRows({
                    shared,
                    siblings,
                    liked: new Set(liked),
                    verdicts,
                    prices,
                  }),
                  cardText(copy),
                )
        }
        {...{ copy }}
      />
      <ActionIcon
        variant="default"
        size={42}
        className={cx(classes['tool'], isOn && classes['liked'])}
        aria-label={isOn ? copy.unlike : copy.like}
        aria-pressed={isOn}
        title={isOn ? copy.unlike : copy.like}
        onClick={() => {
          if (isOn) unlike(label);
          else like(label, zone);
        }}
      >
        <Heart size={18} fill={isOn ? 'currentColor' : 'none'} />
      </ActionIcon>
    </>
  );
}

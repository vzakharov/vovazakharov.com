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
import { type CardText, shareCard } from '../lib/share-card';
import classes from './field-tools.module.scss';
import { ShareImageModal } from './share-image-modal';

/** `label` and `zone` are the name the field holds, as the checker read it. */
type FieldToolsProps = WithCopy & TypedName & CardSiblings;

type Copy = WithCopy['copy'];

/** `typed` is what the copied link opens on: the name as the field holds it. */
type ShareMenuProps = WithCopy &
  Typed & {
    /** Draws the card; none while no domain of the name is known to be free. */
    share: (() => void) | undefined;
  };

function ShareMenu({ typed, share, copy }: ShareMenuProps) {
  const [opened, setOpened] = useState(false);
  // “Copied ✓” stands in for the menu item until the menu closes.
  const { copied, copy: copyText } = useCopied(() => {
    setOpened(false);
  });

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
            copyText(domainLink(typed, new URL(globalThis.location.href)));
          }}
        >
          {copied ? copy.copied : copy.copyLink}
        </Menu.Item>
        <Menu.Item
          leftSection={<ImageIcon size={14} />}
          disabled={share === undefined}
          onClick={share}
        >
          {copy.shareImage}
        </Menu.Item>
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
  const [card, setCard] = useState<File>();
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
        share={
          shared === undefined
            ? undefined
            : () => {
                const rows = cardRows({
                  shared,
                  siblings,
                  liked: new Set(liked),
                  verdicts,
                  prices,
                });

                setCard(shareCard(label, rows, cardText(copy)));
              }
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
      <ShareImageModal
        {...{ card, copy }}
        onClose={() => {
          setCard(undefined);
        }}
      />
    </>
  );
}

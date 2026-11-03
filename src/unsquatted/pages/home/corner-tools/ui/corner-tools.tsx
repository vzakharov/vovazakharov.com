'use client';

import { ActionIcon, Menu } from '@mantine/core';
import { Heart, ImageIcon, LinkIcon, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { SITE_CONFIG, withoutScheme } from '@/kernel/shared/config';
import { cx } from '@/kernel/shared/lib/class-names';
import { pick } from '@/kernel/shared/lib/collections';
import type { Named } from '@/kernel/shared/typings';

import type { WithCopy, WithDomain } from '../../checker';
import { useLikes } from '../../likes';
import {
  availability,
  cardRows,
  type CardSiblings,
  domainLink,
} from '../lib/share';
import { type CardText, shareCard } from '../lib/share-card';
import classes from './corner-tools.module.scss';
import { ShareImageModal } from './share-image-modal';

/**
 * The class of whatever holds a `CornerTools`: hovering or focusing it is what
 * shows the tools that wait for a hover.
 */
export const toolHolder = classes['holder'];

/** How long “Copied ✓” stands in for the menu item before the menu closes. */
const COPIED_MS = 2000;

/** `name` is what the shared card's field holds. */
type CornerToolsProps = WithCopy &
  WithDomain &
  Named &
  CardSiblings & {
    /** What the filled heart unlikes: this domain, unless a chip's whole group. */
    unlikes?: readonly string[];
    /** The filled heart waits for a hover too: on a chip, every name is liked. */
    heartOnHover?: boolean;
  };

type Copy = WithCopy['copy'];

function ShareMenu({
  domain,
  share,
  copy,
}: WithDomain & WithCopy & { share: () => void }) {
  const [opened, setOpened] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const done = setTimeout(() => {
      setCopied(false);
      setOpened(false);
    }, COPIED_MS);

    return () => {
      clearTimeout(done);
    };
  }, [copied]);

  return (
    <Menu
      {...{ opened }}
      onChange={setOpened}
      position="bottom-end"
      shadow="md"
      withinPortal={false}
    >
      <Menu.Target>
        <ActionIcon
          variant="subtle"
          size="sm"
          className={cx(classes['tool'], classes['hoverTool'])}
          aria-label={copy.share}
          title={copy.share}
        >
          <Share2 size={14} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          closeMenuOnClick={false}
          leftSection={<LinkIcon size={14} />}
          onClick={() => {
            const link = domainLink(domain, new URL(globalThis.location.href));

            navigator.clipboard.writeText(link).then(() => {
              setCopied(true);
            }, reportError);
          }}
        >
          {copied ? copy.copied : copy.copyLink}
        </Menu.Item>
        <Menu.Item leftSection={<ImageIcon size={14} />} onClick={share}>
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
 * A domain's heart and share icon, in the corner of whatever shows it. Only a
 * domain that is free or may be gets either, except that a liked one keeps
 * its heart so it can be unliked.
 */
export function CornerTools({
  domain,
  name,
  siblings,
  verdicts,
  prices,
  unlikes = [domain],
  heartOnHover = false,
  copy,
}: CornerToolsProps) {
  const { liked, isLiked, toggle, drop } = useLikes();
  const [card, setCard] = useState<File>();
  const available = availability(verdicts.get(domain)) !== undefined;
  const isOn = isLiked(domain);

  if (!available && !isOn) return null;

  return (
    <span className={classes['tools']}>
      {available && (
        <ShareMenu
          {...{ domain, copy }}
          share={() => {
            const rows = cardRows({
              shared: domain,
              siblings,
              liked: new Set(liked),
              verdicts,
              prices,
            });

            setCard(shareCard(name, rows, cardText(copy)));
          }}
        />
      )}
      <ShareImageModal
        {...{ card, copy }}
        onClose={() => {
          setCard(undefined);
        }}
      />
      <ActionIcon
        variant="subtle"
        size="sm"
        className={cx(
          classes['tool'],
          isOn && classes['liked'],
          (!isOn || heartOnHover) && classes['hoverTool'],
        )}
        aria-label={isOn ? copy.unlike : copy.like}
        aria-pressed={isOn}
        title={isOn ? copy.unlike : copy.like}
        onClick={() => {
          if (isOn) drop(unlikes);
          else toggle(domain);
        }}
      >
        <Heart size={14} fill={isOn ? 'currentColor' : 'none'} />
      </ActionIcon>
    </span>
  );
}

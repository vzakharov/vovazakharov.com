'use client';

import { ActionIcon, Menu } from '@mantine/core';
import { Heart, ImageIcon, LinkIcon, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { SITE_CONFIG, withoutScheme } from '@/kernel/shared/config';
import { cx } from '@/kernel/shared/lib/class-names';
import { pick } from '@/kernel/shared/lib/collections';

import type { Verdict } from '../../verdict';
import type { WithCopy } from '../config/i18n';
import type { Prices } from '../lib/price';
import type { WithDomain } from '../lib/rows';
import { availability, cardRows, domainLink } from '../lib/share';
import { type CardText, shareCard, shareFile } from '../lib/share-card';
import { useLikes } from './likes-state';
import classes from './unsquatted-home.module.scss';

/** How long “copied ✓” stands in for the menu item before the menu closes. */
const COPIED_MS = 2000;

type CornerToolsProps = WithCopy &
  WithDomain & {
    /** The name the shared card's field holds. */
    name: string;
    /** The domains the shared card may list besides this one, in order. */
    siblings: readonly string[];
    /** The lookups in hand, this domain's and its siblings'. */
    verdicts: ReadonlyMap<string, Verdict>;
    prices: Prices;
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
 * its heart so it can be unliked; the filled heart always shows, and the rest
 * only while their holder is hovered or focused, wherever the pointer can
 * hover.
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

            shareFile(shareCard(name, rows, cardText(copy))).catch(reportError);
          }}
        />
      )}
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

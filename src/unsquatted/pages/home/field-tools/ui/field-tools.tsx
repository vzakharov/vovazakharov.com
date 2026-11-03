'use client';

import { ActionIcon, Menu } from '@mantine/core';
import { Heart, ImageIcon, LinkIcon, Share2 } from 'lucide-react';
import { useState } from 'react';

import { SITE_CONFIG, withoutScheme } from '@/kernel/shared/config';
import { cx } from '@/kernel/shared/lib/class-names';
import { pick } from '@/kernel/shared/lib/collections';
import type { Typed } from '@/kernel/shared/typings';

import { useCopied } from '@/shell/shared/ui';

import { plainByline, type TypedName, type WithCopy } from '../../checker';
import { likeOf, preferredOf, useLikes } from '../../likes';
import {
  availability,
  cardRows,
  type CardSiblings,
  domainLink,
} from '../lib/share';
import { canCopyImage, type CardText, shareCard } from '../lib/share-card';
import { CopiedToast } from './copied-toast';
import classes from './field-tools.module.scss';

/** The class of a square button beside the field, the dice's included. */
export const TOOL_BUTTON = classes['tool'];

/** `label` and `zone` are the name the field holds, as the checker read it. */
type FieldToolsProps = WithCopy & TypedName & CardSiblings;

type Copy = WithCopy['copy'];

/** `typed` is what the copied link opens on: the name as the field holds it. */
type ShareMenuProps = WithCopy &
  Typed & {
    /** Draws the card; none while no domain of the name is known to be free. */
    drawCard: (() => File) | undefined;
  };

type LabelProps = { children: readonly string[]; showing: number };

/**
 * The one of `children` at `showing`, laid over the others, which keep their
 * room, so the menu holds its width when an item's text changes.
 */
function Label({ children, showing }: LabelProps) {
  return (
    <span className={classes['label']}>
      {children.map((text, index) => (
        <span
          key={text}
          aria-hidden={index !== showing}
          data-shown={index === showing}
        >
          {text}
        </span>
      ))}
    </span>
  );
}

function ShareMenu({ typed, drawCard, copy }: ShareMenuProps) {
  const [opened, setOpened] = useState(false);
  const [card, setCard] = useState<File>();
  const [from, setFrom] = useState<DOMRect>();
  const close = () => {
    setOpened(false);
  };
  const link = useCopied(close);
  const image = useCopied(close);

  return (
    <>
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
            <Label showing={link.copied ? 1 : 0}>
              {[copy.copyLink, copy.copied]}
            </Label>
          </Menu.Item>
          {canCopyImage() && (
            <Menu.Item
              closeMenuOnClick={false}
              leftSection={<ImageIcon size={14} />}
              disabled={drawCard === undefined}
              onClick={(event) => {
                if (drawCard === undefined) return;
                const drawn = drawCard();

                setCard(drawn);
                setFrom(
                  (
                    event.currentTarget.closest('[role="menu"]') ??
                    event.currentTarget
                  ).getBoundingClientRect(),
                );
                image.copy(drawn);
              }}
            >
              <Label showing={image.copied ? 1 : 0}>
                {[copy.copyAsImage, copy.copied]}
              </Label>
            </Menu.Item>
          )}
        </Menu.Dropdown>
      </Menu>
      <CopiedToast {...pick(image, 'copied')} {...{ card, from }} />
    </>
  );
}

const cardText = (copy: Copy): CardText => ({
  site: SITE_CONFIG.name,
  host: withoutScheme(SITE_CONFIG.url),
  footer: `${copy.lede.replace('*', '')} ${plainByline({ copy })}`,
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
  const { likeFor, like, unlike } = useLikes();
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
        typed={likeOf(label, zone)}
        drawCard={
          shared === undefined
            ? undefined
            : () =>
                shareCard(
                  label,
                  cardRows({
                    shared,
                    siblings,
                    // A name liked with no zone is liked in the card's lead.
                    liked: isOn ? (preferred ?? shared) : undefined,
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

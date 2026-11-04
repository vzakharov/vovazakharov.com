'use client';

import { ActionIcon, Loader, Menu } from '@mantine/core';
import { ImageIcon, LinkIcon, Share2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { SITE_CONFIG, withoutScheme } from '@/kernel/shared/config';
import { pick } from '@/kernel/shared/lib/collections';
import type { Typed } from '@/kernel/shared/typings';

import { useCopied } from '@/shell/shared/ui';

import { plainByline, type WithCopy } from '@/unsquatted/shared/i18n';
import type { TypedName } from '@/unsquatted/entities/domain';
import {
  LikeButton,
  likeOf,
  preferredOf,
  useLikes,
} from '@/unsquatted/features/like';

import {
  availability,
  cardRows,
  type CardSiblings,
  domainLink,
} from '../lib/share';
import {
  canCopyImage,
  CARD_TYPE,
  type CardText,
  shareCard,
} from '../lib/share-card';
import { CopiedToast, TOAST_MS } from './copied-toast';
import classes from './field-tools.module.scss';

/** The class of a square button beside the field, the dice's included. */
export const TOOL_BUTTON = classes['tool'];

/**
 * `onReached` is called once the share menu is reached for, so the card's
 * lookups can start; `looking` holds while any lookup is unanswered.
 */
type Reached = { onReached: () => void; looking: boolean };

type Sharing = WithCopy & Reached;

/** `label` and `zone` are the name the field holds, as the checker read it. */
type FieldToolsProps = Sharing & TypedName & CardSiblings;

type Copy = WithCopy['copy'];

/** Draws the card; none while no domain of the name is known to be free. */
type DrawCard = (() => Promise<File>) | undefined;

/** `typed` is what the copied link opens on: the name as the field holds it. */
type ShareMenuProps = Sharing & Typed & { drawCard: DrawCard };

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

/**
 * The card's drawing once no lookup is unanswered, taken from the render that
 * has their answers, so a tap that beats the lookups still lists them.
 */
function useDrawWhenLooked(looking: boolean, drawCard: DrawCard) {
  const waitingRef = useRef<Array<(draw: DrawCard) => void>>([]);

  // Every render: the one to answer the waiters is any whose lookups are done.
  useEffect(() => {
    if (looking) return;
    for (const answer of waitingRef.current.splice(0)) answer(drawCard);
  });

  return async () => {
    const draw = looking
      ? await new Promise<DrawCard>((answer) => {
          waitingRef.current.push(answer);
        })
      : drawCard;

    if (draw === undefined) throw new Error('No domain of the name is free');

    return draw();
  };
}

function ShareMenu({
  typed,
  drawCard,
  onReached,
  looking,
  copy,
}: ShareMenuProps) {
  const [opened, setOpened] = useState(false);
  const [card, setCard] = useState<File>();
  const [copying, setCopying] = useState(false);
  const close = () => {
    setOpened(false);
  };
  const link = useCopied(close);
  const image = useCopied(undefined, TOAST_MS);
  const drawLooked = useDrawWhenLooked(looking, drawCard);

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
            onPointerEnter={onReached}
            onFocus={onReached}
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
            // The menu stays open while the card waits for its lookups, so
            // the wait shows where it was asked for; the toast follows it.
            <Menu.Item
              closeMenuOnClick={false}
              leftSection={
                copying ? <Loader size={14} /> : <ImageIcon size={14} />
              }
              disabled={drawCard === undefined}
              onClick={() => {
                if (drawCard === undefined || copying) return;
                setCopying(true);
                image.copy({
                  type: CARD_TYPE,
                  made: drawLooked()
                    .then((drawn) => {
                      setCard(drawn);
                      close();

                      return drawn;
                    })
                    .finally(() => {
                      setCopying(false);
                    }),
                });
              }}
            >
              <Label showing={copying ? 1 : 0}>
                {[copy.copyAsImage, copy.copyingImage]}
              </Label>
            </Menu.Item>
          )}
        </Menu.Dropdown>
      </Menu>
      <CopiedToast
        {...pick(image, 'copied')}
        said={copy.imageCopied}
        {...pick(copy, 'dismiss')}
        {...{ card }}
      />
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
 * first the lookups say is free or may be. Reaching for the share button asks
 * for the domains not yet looked up, and the card waits for their answers.
 */
export function FieldTools({
  label,
  zone,
  siblings,
  verdicts,
  prices,
  onReached,
  looking,
  copy,
}: FieldToolsProps) {
  const { likeFor } = useLikes();
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
            : async () =>
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
        {...{ onReached, looking, copy }}
      />
      <LikeButton
        variant="default"
        size={42}
        className={classes['tool']}
        name={label}
        iconSize={18}
        {...{ zone, copy }}
      />
    </>
  );
}

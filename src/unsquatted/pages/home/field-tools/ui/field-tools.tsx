'use client';

import { ActionIcon, Button, Popover } from '@mantine/core';
import { ImageIcon, LinkIcon, Share2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { SITE_CONFIG, withoutScheme } from '@/kernel/shared/config';
import { pick } from '@/kernel/shared/lib/collections';
import type { Labeled, Typed } from '@/kernel/shared/typings';

import { useCopied } from '@/shell/shared/ui';

import { plainByline, type TypedName, type WithCopy } from '../../checker';
import { LikeButton, likeOf, preferredOf, useLikes } from '../../likes';
import {
  cardLead,
  cardRows,
  type CardSiblings,
  domainLink,
} from '../lib/share';
import { canCopyImage, type CardText, shareCard } from '../lib/share-card';
import { CardPreview, type CardState, useObjectUrl } from './card-preview';
import classes from './field-tools.module.scss';
import { useDrawnAhead, useShareSheet } from './share-sheet';

/** The class of a square button beside the field, the dice's included. */
export const TOOL_BUTTON = classes['tool'];

/**
 * `onReached` is called once the share button is reached for, so the card's
 * lookups can start; `looking` holds while any lookup is unanswered.
 */
type Reached = { onReached: () => void; looking: boolean };

type Sharing = WithCopy & Reached;

/** `label` and `zone` are the name the field holds, as the checker read it. */
type FieldToolsProps = Sharing &
  TypedName &
  CardSiblings & {
    /** The domains the checker has on screen, the only ones a free card may lead with. */
    shown: readonly string[];
  };

type Copy = WithCopy['copy'];

/** Draws the card; none while no lookup of the name's domains has an answer. */
type DrawCard = (() => Promise<File>) | undefined;

/**
 * `typed` is what the copied link opens on: the name as the field holds it;
 * `label` is the name the card is drawn for.
 */
type SharePopoverProps = Sharing &
  Typed &
  Labeled & {
    drawCard: DrawCard;
    /** Names what `drawCard` draws, so a card drawn ahead is known stale. */
    cardKey: string | undefined;
  };

type LabelProps = { children: readonly string[]; showing: number };

/**
 * The one of `children` at `showing`, laid over the others, which keep their
 * room, so a button holds its width when its text changes.
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
 * has their answers, so a card drawn before the lookups are in still lists
 * them; `undefined` where no lookup answered at all.
 */
function useDrawWhenLooked(looking: boolean, drawCard: DrawCard) {
  const waitingRef = useRef<Array<(draw: DrawCard) => void>>([]);

  // Every render: the one to answer the waiters is any whose lookups are done.
  useEffect(() => {
    if (looking) return;
    for (const answer of waitingRef.current.splice(0)) answer(drawCard);
  });

  return async (): Promise<File | undefined> => {
    const draw = looking
      ? await new Promise<DrawCard>((answer) => {
          waitingRef.current.push(answer);
        })
      : drawCard;

    return draw?.();
  };
}

/**
 * The popover's width, as wide as a phone leaves room for. A prop rather than
 * a class, since Mantine writes the dropdown's width inline — reading every
 * bare number in it as pixels, so the gutter is a spacing step, not `2 * md`.
 */
const SHARE_WIDTH = 'min(400px, calc(100vw - var(--mantine-spacing-xl)))';

/**
 * The card is drawn afresh each time the popover opens, for the name and
 * likes as they are then; a drawing an earlier opening started and a later
 * one overtook is dropped. Where the system has a share sheet, a tap hands it
 * the card drawn ahead and the link instead, and asks for no lookup: the card
 * is what is on screen. The popover stands in while that card is not drawn
 * yet, or when the sheet fails.
 */
function SharePopover({
  typed,
  label,
  drawCard,
  cardKey,
  onReached,
  looking,
  copy,
}: SharePopoverProps) {
  const sheet = useShareSheet();
  const ahead = useDrawnAhead(cardKey, drawCard, sheet);
  // Read on use: the page is rendered at build time too, with no location.
  const href = () => domainLink(typed, new URL(globalThis.location.href));
  const [opened, setOpened] = useState(false);
  const [card, setCard] = useState<CardState>('drawing');
  const openingRef = useRef(0);
  const close = () => {
    setOpened(false);
  };
  const link = useCopied(close);
  const image = useCopied(close);
  const drawLooked = useDrawWhenLooked(looking, drawCard);
  const url = useObjectUrl(card instanceof File ? card : undefined);
  const open = () => {
    onReached();
    setOpened(true);
    setCard('drawing');
    const opening = ++openingRef.current;
    const settle = (state: CardState) => {
      if (opening === openingRef.current) setCard(state);
    };

    drawLooked().then(
      (drawn) => {
        settle(drawn ?? 'none');
      },
      (error: unknown) => {
        settle('failed');
        reportError(error);
      },
    );
  };
  const share = (file: File) => {
    navigator.share({ files: [file], url: href() }).catch((error: unknown) => {
      // Dismissing the sheet rejects the share too, and that is no failure.
      if (error instanceof DOMException && error.name === 'AbortError') return;
      reportError(error);
      open();
    });
  };
  const reached = sheet ? undefined : onReached;

  return (
    <Popover
      {...{ opened }}
      onDismiss={close}
      position="bottom-end"
      shadow="md"
      width={SHARE_WIDTH}
    >
      <Popover.Target>
        <ActionIcon
          variant="default"
          size={42}
          className={classes['tool']}
          aria-label={copy.share}
          title={copy.share}
          aria-expanded={opened}
          onPointerEnter={reached}
          onFocus={reached}
          onClick={() => {
            if (opened) close();
            else if (
              ahead !== undefined &&
              navigator.canShare({ files: [ahead] })
            )
              share(ahead);
            else open();
          }}
        >
          <Share2 size={18} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown className={classes['share']}>
        <LinkField href={href()} {...{ link, copy }} />
        {canCopyImage() && (
          <Button
            fullWidth
            leftSection={<ImageIcon size={14} />}
            disabled={!(card instanceof File)}
            onClick={() => {
              if (card instanceof File) image.copy(card);
            }}
          >
            <Label showing={image.copied ? 1 : 0}>
              {[copy.copyAsImage, copy.copied]}
            </Label>
          </Button>
        )}
        <CardPreview
          {...{ card, url }}
          alt={copy.cardAlt.replace('{name}', label)}
          said={{
            drawing: copy.drawingImage,
            none: copy.noImage,
            failed: copy.imageFailed,
          }}
        />
      </Popover.Dropdown>
    </Popover>
  );
}

type LinkFieldProps = WithCopy & {
  href: string;
  link: ReturnType<typeof useCopied>;
};

/**
 * The link as a field, its scheme left off, beside the button that copies it
 * whole; selectable by hand where the clipboard refuses the button.
 */
function LinkField({ href, link, copy }: LinkFieldProps) {
  return (
    <div className={classes['linkBox']}>
      <input
        readOnly
        value={withoutScheme(href)}
        aria-label={copy.linkLabel}
        className={classes['linkField']}
        onFocus={(event) => {
          event.currentTarget.select();
        }}
      />
      <Button
        variant="default"
        leftSection={<LinkIcon size={14} />}
        className={classes['linkCopy']}
        onClick={() => {
          link.copy(href);
        }}
      >
        <Label showing={link.copied ? 1 : 0}>
          {[copy.copyLink, copy.copied]}
        </Label>
      </Button>
    </div>
  );
}

function cardText(copy: Copy): CardText {
  const lede = copy.lede.replace('*', '');

  return {
    site: SITE_CONFIG.name,
    host: withoutScheme(SITE_CONFIG.url),
    footer: `${lede} ${plainByline({ copy })}`,
    lede,
    aside: copy.takenAside,
    ...pick(copy, 'verdict', 'price'),
  };
}

/**
 * The name in the field's share and heart buttons. Both are about the name as
 * a whole: the heart likes it, with the zone typed after it as the one
 * preferred, and the card leads with that zone, else the liked one, else the
 * first the lookups say is free or may be — or, where none is, the first of
 * them taken. Reaching for the share button asks for the domains not yet
 * looked up, and the card waits for their answers.
 */
export function FieldTools({
  label,
  zone,
  siblings,
  shown,
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
  const shared = cardLead([typedDomain, preferred, ...siblings], shown, {
    verdicts,
  });
  const rows =
    shared === undefined
      ? undefined
      : cardRows({
          shared,
          siblings,
          // A name liked with no zone is liked in the card's lead.
          liked: isOn ? (preferred ?? shared) : undefined,
          verdicts,
          prices,
        });

  return (
    <>
      <SharePopover
        typed={likeOf(label, zone)}
        drawCard={
          rows === undefined
            ? undefined
            : async () => shareCard(label, rows, cardText(copy))
        }
        cardKey={rows === undefined ? undefined : JSON.stringify([label, rows])}
        {...{ label, onReached, looking, copy }}
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

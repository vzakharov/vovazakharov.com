'use client';

import { Stack, Text, Title } from '@mantine/core';
import { useEffect, useState, useSyncExternalStore } from 'react';

import {
  addressLocale,
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
  type WithOptionalLocale,
} from '@/kernel/shared/i18n';

import { TextLink } from '@/shell/shared/ui';

import type { Slugged } from '@/blog/shared/content';

import type { Messages } from '@/vova/shared/i18n';

type MovedSongProps = {
  /** The music section's root, where a song once sat directly. */
  musicRoute: string;
  /** Where songs sit now: the collection's route. */
  songsRoute: string;
  copy: Record<Locale, Messages['notFound']>;
};

type FormerSongAddress = Slugged & WithOptionalLocale;

/**
 * A song's address from before songs moved under their collection's route —
 * `/music/<slug>`, or `/music/<slug>/<locale>` — read off a missed one.
 */
function formerSongAddress(
  pathname: string | null,
  musicRoute: string,
): FormerSongAddress | undefined {
  if (pathname?.startsWith(`${musicRoute}/`) !== true) return;

  const segments = pathname.slice(musicRoute.length).split('/').filter(Boolean);
  const [slug, locale] = segments;

  if (slug === undefined || segments.length > 2) return;
  if (locale !== undefined && !isLocale(locale)) return;

  return { slug, locale };
}

function unsubscribe() {
  // The address never changes under a page that leaves by a full load.
}

function subscribe() {
  return unsubscribe;
}

function currentPathname() {
  return globalThis.location.pathname;
}

function noPathname() {
  return null;
}

async function isServed(href: string, signal: AbortSignal): Promise<boolean> {
  const { ok } = await fetch(href, { method: 'HEAD', signal });

  return ok;
}

/**
 * The 404 page's body, in the language the missed address names. One
 * `404.html` answers every address, so the address is read in the browser —
 * where a static export also gets its only redirect: a missed address shaped
 * like a song's former one asks whether the song's markdown sits at its new
 * route, and replaces the page with the song if so.
 */
export function MovedSong({ musicRoute, songsRoute, copy }: MovedSongProps) {
  const pathname = useSyncExternalStore(subscribe, currentPathname, noPathname);
  const [missing, setMissing] = useState(false);
  const former = formerSongAddress(pathname, musicRoute);

  useEffect(() => {
    const song = formerSongAddress(pathname, musicRoute);

    if (song === undefined) return;

    const route = `${songsRoute}/${song.slug}`;
    const controller = new AbortController();

    // A probe that fails answers as a missing song does: the 404 stands.
    isServed(`${route}.md`, controller.signal).then(
      (served) => {
        if (served) {
          globalThis.location.replace(
            song.locale === undefined ? route : `${route}/${song.locale}`,
          );
        } else {
          setMissing(true);
        }
      },
      () => {
        if (!controller.signal.aborted) setMissing(true);
      },
    );

    return () => {
      controller.abort();
    };
  }, [pathname, musicRoute, songsRoute]);

  const { title, body, checking, home } =
    copy[pathname === null ? DEFAULT_LOCALE : addressLocale(pathname)];

  return (
    <Stack gap={16} align="flex-start">
      <Title order={1}>{title}</Title>
      <Text c="dimmed">
        {former !== undefined && !missing ? checking : body}
      </Text>
      <TextLink href="/">{home}</TextLink>
    </Stack>
  );
}

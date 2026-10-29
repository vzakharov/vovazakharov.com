'use client';

import { Text, Title, UnstyledButton } from '@mantine/core';
import { Info, Radio } from 'lucide-react';
import { useEffect, useEffectEvent, useState } from 'react';

import { cx } from '@/kernel/shared/lib/class-names';
import { pick } from '@/kernel/shared/lib/collections';

import { InternalButton, NameLink, NotedSpan } from '@/shell/shared/ui';

import type { HookRun } from '@/music/shared/catalogue';
import type { SpelledLink } from '@/music/shared/catalogue/index.node-safe';
import type { Messages } from '@/music/shared/i18n';
import { BillingLinks, Spelling } from '@/music/shared/ui';
import { CoverZoom, type CoverZoomLabels } from '@/music/entities/cover';
import { HookRuns } from '@/music/entities/hook';
import { stationOffset, usePlayer } from '@/music/features/player';

import classes from './radio.module.scss';
import { RadioDial } from './radio-dial';

/** What the page shows beside a song, resolved at build for every one the radio may play. */
export type OnAirExtras = {
  cover?: string | undefined;
  album?: SpelledLink | undefined;
  hook?: HookRun[] | undefined;
};

export type OnAirProps = {
  labels: Messages['radioPage'];
  zoom: CoverZoomLabels;
  /** The song page's “from {album}”. */
  albumLine: string;
  /** One round of the public catalogue, in words. */
  cycleLength: string;
  extras: Record<string, OnAirExtras>;
};

/**
 * The device's clock, ticking on each whole second — when a slot boundary or
 * the counter's next second falls. Undefined until mount, a build not knowing
 * the hour it will be read at.
 */
function useClock(): number | undefined {
  const [now, setNow] = useState<number>();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      setNow(Date.now());
      timer = setTimeout(tick, 1000 - (Date.now() % 1000));
    };

    timer = setTimeout(tick, 0);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return now;
}

/**
 * The radio's set: what is on air and how far into it, from the clock and the
 * same catalogue the player tunes by, whether or not anything plays. On mount
 * it tries to tune in, which the browser may refuse.
 */
export function OnAir({
  labels,
  zoom,
  albumLine,
  cycleLength,
  extras,
}: OnAirProps) {
  const { state, current, locale, onAir, tryTuneIn, tuneIn } = usePlayer();
  const now = useClock();
  const [wasTuned, setWasTuned] = useState(false);

  if (state.radio && !wasTuned) setWasTuned(true);

  // Only with nothing in the player: a loaded track's source swap would race
  // the attempt and abort its own `play()`.
  const land = useEffectEvent(() => {
    if (current === undefined) tryTuneIn();
  });

  // On the clock's first tick, not at mount: the player that owns the element
  // is an ancestor, and an ancestor's mount effect runs after this one's, so
  // at mount there is no element to play yet.
  const ticking = now !== undefined;

  useEffect(() => {
    if (ticking) land();
  }, [ticking]);

  const air = now === undefined ? undefined : onAir(now);
  const extra = air && extras[air.track.slug];
  const [beforeAlbum, afterAlbum] = albumLine.split('{album}');

  return (
    <div className={classes['radio']}>
      <div className={classes['set']}>
        <Title order={1} className={classes['heading']}>
          {labels.title}
        </Title>
        <div className={classes['pitch']}>
          {labels.pitch}{' '}
          <NotedSpan
            words={
              <Info
                size={15}
                className={classes['aboutIcon']}
                aria-label={labels.aboutLabel}
              />
            }
          >
            {labels.about.replace('{length}', cycleLength)}
          </NotedSpan>
        </div>

        <div className={classes['nowPlaying']}>
          {state.radio && <span className={classes['dot']} />}
          {labels.nowPlaying}
        </div>

        <div className={classes['onAir']}>
          {air && extra && (
            <div
              className={cx(
                classes['song'],
                extra.cover === undefined && classes['songBare'],
              )}
            >
              {extra.cover !== undefined && (
                <CoverZoom
                  src={extra.cover}
                  sizeClass={classes['cover']}
                  {...zoom}
                />
              )}
              <div className={classes['songLines']}>
                <div className={classes['songTitle']}>
                  <NameLink href={air.track.routes[locale]} c="inherit">
                    <Spelling {...air.track.titles[locale]} />
                  </NameLink>
                </div>
                <div className={classes['songMeta']}>
                  <BillingLinks billing={air.track.billing[locale]} />
                </div>
                {extra.album && (
                  <div className={classes['songMeta']}>
                    {beforeAlbum}
                    <NameLink {...pick(extra.album, 'href')} c="inherit">
                      <Spelling {...extra.album.name} />
                    </NameLink>
                    {afterAlbum}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={classes['dial']}>
          {air && now !== undefined && (
            <RadioDial
              key={`${String(air.station.cycle)}/${String(air.station.cursor)}`}
              {...pick(air.track, 'seconds')}
              into={stationOffset(air.station, now)}
            />
          )}
        </div>

        {!state.radio && (
          <UnstyledButton className={classes['knob']} onClick={tuneIn}>
            <Radio size={24} />
            {wasTuned ? labels.tuneBackIn : labels.tuneIn}
          </UnstyledButton>
        )}

        {state.radio && air && (
          <div className={classes['story']}>
            {extra?.hook !== undefined && <HookRuns runs={extra.hook} />}
            <div className={classes['cta']}>
              <InternalButton
                href={air.track.routes[locale]}
                variant="outline"
                radius="xl"
              >
                {labels.readMore}
              </InternalButton>
              <Text size="xs" opacity={0.55} mt={8}>
                {labels.keepsPlaying}
              </Text>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

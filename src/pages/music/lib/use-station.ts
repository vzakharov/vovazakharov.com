import { type ActionDispatch, useEffect, useMemo, useRef } from 'react';

import type { Decks } from './decks';
import {
  type PlayerTrack,
  seguePositions,
  type WithTrack,
} from './player-state';
import type { OnRadio, RadioPlayerAction } from './radio-state';
import {
  nextStation,
  type Station,
  stationAt,
  stationOffset,
  stationTrack,
} from './station';

/** How far, in seconds, the element may drift from the station before it is re-seeked. */
const DRIFT = 1;

/** A slot and the song it plays. */
type OnAir = WithTrack & { station: Station };

export type StationControls = {
  /** Plays the radio from where it is now — the live moment, even when already on. */
  tuneIn: () => void;
  /**
   * `tuneIn` that commits nothing until the browser lets the element play: a
   * refused autoplay leaves the player as it was, with nothing in the bar.
   */
  tryTuneIn: () => void;
  /** What is on air at `nowMs`, whether or not anything plays. */
  onAir: (nowMs: number) => OnAir | undefined;
};

type StationInput = OnRadio & {
  /** The player's audio, read when it is needed rather than held. */
  decks: () => Decks | null;
  /** The file the element loads for a track, in the quality the reader chose. */
  source: (track: PlayerTrack) => string;
  /** The public catalogue, whose positions the station's order holds. */
  catalogue: PlayerTrack[];
  dispatch: ActionDispatch<[RadioPlayerAction]>;
  /** Shuffle on as the radio tunes, or the stored switch would undo the cycle's order. */
  storeShuffle: (on: boolean) => void;
};

export type StationKeeper = StationControls & {
  /** The song of the slot after the one playing, while the radio is on. */
  upNext: () => PlayerTrack | undefined;
  /**
   * Plays the next slot if the radio is on, and says whether it did. An element
   * already holding the slot's song plays it from where it is, which drift
   * alone corrects: it was started on time, and a seek would break the join.
   */
  handOver: () => boolean;
  /**
   * Seeks to the station if a seek is owed or playback has drifted from it —
   * for the element's `loadedmetadata`, where an owed seek can land, and its
   * `playing`, which follows every recovery from a stall.
   */
  keepTime: () => void;
};

/**
 * Keeps the playing element on the radio's timetable while the radio is on. The clock is the device's — there is no server to ask.
 */
export function useStation({
  decks,
  source,
  catalogue,
  radio,
  dispatch,
  storeShuffle,
}: StationInput): StationKeeper {
  // The slot the radio plays, and whether its seek is still owed — the master
  // may take seconds to arrive, and the listener joins where the station is
  // _then_, not where it was at the click.
  const slotRef = useRef<Station | undefined>(undefined);
  const seekOwedRef = useRef(false);

  // A release before the master arrived owes the station nothing.
  useEffect(() => {
    if (!radio) seekOwedRef.current = false;
  }, [radio]);

  // One object per catalogue and radio state, so the controls built on it are
  // not rebuilt on every `timeupdate`.
  return useMemo(() => {
    const durations = catalogue.map(({ seconds }) => seconds);
    const segues = seguePositions(catalogue);

    function trackOf(slot: Station): PlayerTrack | undefined {
      const position = stationTrack(slot);

      return position === undefined ? undefined : catalogue[position];
    }

    function onAir(nowMs: number): OnAir | undefined {
      const station = stationAt(durations, nowMs, segues);
      const track = station && trackOf(station);

      return station && track && { station, track };
    }

    function keepTime() {
      const playing = decks();
      const slot = slotRef.current;
      const track = slot && trackOf(slot);

      if (playing === null) return;

      const audio = playing.active();

      if (
        slot === undefined ||
        track === undefined ||
        !(radio || seekOwedRef.current) ||
        playing.loaded() !== source(track) ||
        audio.readyState < HTMLMediaElement.HAVE_METADATA
      ) {
        return;
      }

      const target = stationOffset(slot, Date.now());

      if (seekOwedRef.current || Math.abs(audio.currentTime - target) > DRIFT) {
        audio.currentTime = target;
      }
      seekOwedRef.current = false;
    }

    function tuneTo(slot: Station, inPlace = false) {
      slotRef.current = slot;
      seekOwedRef.current = !inPlace;
      storeShuffle(true);
      dispatch({ type: 'tune', ...slot });
      // The song already loaded is the one on air: no source change follows to
      // seek on, so the seek is now.
      keepTime();
    }

    function tuneIn() {
      const slot = stationAt(durations, Date.now(), segues);

      if (slot !== undefined) tuneTo(slot);
    }

    function tryTuneIn() {
      const playing = decks();
      const now = onAir(Date.now());

      if (playing === null || now === undefined) return;

      slotRef.current = now.station;
      seekOwedRef.current = true;
      playing.load(source(now.track));
      const audio = playing.active();
      // Tuned afresh once allowed: the station may have moved on while the
      // browser decided.
      audio.play().then(tuneIn, (error: unknown) => {
        // A refusal is the browser's answer, not a failure: the page waits for
        // the press it asked for.
        if (
          !(error instanceof DOMException && error.name === 'NotAllowedError')
        ) {
          throw error;
        }
      });
    }

    function following(): Station | undefined {
      const slot = slotRef.current;

      return radio && slot !== undefined
        ? nextStation(durations, slot, Date.now(), segues)
        : undefined;
    }

    function upNext(): PlayerTrack | undefined {
      const next = following();

      return next && trackOf(next);
    }

    function handOver(): boolean {
      const next = following();

      if (next === undefined) return false;

      const track = trackOf(next);
      tuneTo(next, track !== undefined && decks()?.loaded() === source(track));

      return true;
    }

    return { tuneIn, tryTuneIn, onAir, upNext, handOver, keepTime };
  }, [decks, source, catalogue, radio, dispatch, storeShuffle]);
}

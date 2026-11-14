'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { fillSlots } from '@/kernel/shared/i18n';

import {
  roomKey,
  type Signed,
  type SignKind,
  type SignMount,
} from '@/cube/entities/world';

import { PLAY_QUERY } from '../lib/play';
import { startOf } from '../lib/start';
import classes from './cube.module.scss';
import type { Selling } from './cube-mesh';
import type { CubeScene } from './cube-scene';
import { FrameRate } from './frame-rate';
import type { PillCopy, PillPrompt } from './pill-prompt';
import type { QualityWay } from './quality';
import { SaleOffer } from './sale-offer';
import { walk, type Way } from './walk';

type CubeCanvasProps = {
  /** The canvas's accessible name. */
  canvas: string;
  /** The one line shown where the browser has no WebGPU. */
  unsupported: string;
  /** The floor the eye stands on, `{floor}` its number. */
  floor: string;
  /** The one line shown when the URL's fragment leads nowhere. */
  nowhere: string;
  /** The hint for each way, a sign's and a pill's taking its place first. */
  ways: Record<Way | QualityWay, string>;
  /** The lines shown by a pill in reach and by one in the hand. */
  pill: PillCopy;
  /** A for-sale room's sign, hint and offer. */
  offer: Selling['copy'];
};

/** The canvas the cube draws into, filling the viewport. */
export function CubeCanvas({
  canvas: label,
  unsupported,
  floor: floorLine,
  nowhere,
  ways,
  pill: pillCopy,
  offer: offerCopy,
}: CubeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failure, setFailure] = useState<Error | null>(null);
  const [missing, setMissing] = useState(false);
  const [lost, setLost] = useState(false);
  // Set every frame, which re-renders only on a new floor or reach: React
  // drops a set to the value the state already holds.
  const [floor, setFloor] = useState<number | null>(null);
  /** The kind of the sign in reach, if one is. */
  const [inReach, setInReach] = useState<SignKind | null>(null);
  /** What a press does where the body stands, a sign in reach aside. */
  const [way, setWay] = useState<Way | QualityWay | null>(null);
  const [pill, setPill] = useState<PillPrompt | null>(null);
  /** Whether an offer is open, read by every frame. */
  const offeringRef = useRef(false);
  const [offer, setOffer] = useState<Signed | null>(null);
  /**
   * The rooms bought on this page, each where its sign hung: held for the
   * page's life alone, the purchase being a demo that charges nothing.
   */
  const holdingsRef = useRef(new Map<string, SignMount>());
  const sceneRef = useRef<CubeScene | null>(null);
  // Stable, so the meter's window does not restart on every render here.
  const passTimes = useCallback(
    () => sceneRef.current?.passTimes() ?? null,
    [],
  );
  const timing = useCallback((on: boolean) => {
    sceneRef.current?.timing(on);
  }, []);
  // Thrown while rendering, so the route's error boundary shows it.
  if (failure !== null) throw failure;

  const closeOffer = () => {
    offeringRef.current = false;
    setOffer(null);
  };

  const buy = () => {
    if (offer === null) return;
    const { room, sign } = offer;
    const { at, facing, onPost } = sign;
    holdingsRef.current.set(roomKey(room), { at, facing, onPost });
    sceneRef.current?.refresh();
    setOffer({ room, sign: { ...sign, kind: 'yours' } });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const query = new URLSearchParams(globalThis.location.search);
    let live = true;
    startOf(query, globalThis.location.hash.slice(1))
      .then((start) => {
        if (!live) return;
        if (start === null) {
          setLost(true);
          return;
        }
        sceneRef.current = walk(
          canvas,
          start,
          query.has(PLAY_QUERY),
          { copy: offerCopy, bought: () => holdingsRef.current },
          {
            setFloor,
            setFailure,
            setMissing,
            setInReach,
            setWay: (next) => {
              setWay(sceneRef.current?.hinted(next) ?? next);
            },
            setPill,
            open: (signed) => {
              offeringRef.current = true;
              setOffer(signed);
            },
            offering: () => offeringRef.current,
          },
        );
      })
      .catch(setFailure);
    return () => {
      live = false;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [offerCopy]);

  if (lost) return <p className={classes['notice']}>{nowhere}</p>;
  if (missing) return <p className={classes['notice']}>{unsupported}</p>;
  return (
    <>
      <canvas
        ref={canvasRef}
        className={classes['cube']}
        aria-label={label}
        tabIndex={0}
      />
      {floor !== null && (
        <p className={classes['floor']} aria-live="polite">
          {fillSlots(floorLine, { floor })}
        </p>
      )}
      <FrameRate {...{ passTimes, timing }} />
      <p className={classes['hint']} aria-live="polite">
        {pill === null
          ? offer === null
            ? inReach === 'yours'
              ? offerCopy.hintYours
              : inReach === null
                ? way === null
                  ? ''
                  : ways[way]
                : offerCopy.hint
            : ''
          : pillCopy[pill]}
      </p>
      <SaleOffer
        {...{ offer }}
        onBuy={buy}
        onClose={closeOffer}
        copy={offerCopy}
      />
    </>
  );
}

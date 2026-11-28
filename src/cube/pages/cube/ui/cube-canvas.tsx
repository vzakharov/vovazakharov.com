'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { fillSlots } from '@/kernel/shared/i18n';
import { pick } from '@/kernel/shared/lib/collections';

import {
  type Holdings,
  priceOf,
  roomKey,
  type Signed,
  type SignKind,
} from '@/cube/entities/world';
import { buy as buyRoom } from '@/cube/features/account';
import type { Said } from '@/cube/features/player';

import type COPY from '../config/messages/en.json';
import { PLAY_QUERY } from '../lib/play';
import { startOf } from '../lib/start';
import { AccountDialog } from './account-dialog';
import classes from './cube.module.scss';
import type { Selling } from './cube-mesh';
import { Cubes } from './cubes-mark';
import { FrameRate } from './frame-rate';
import type { PillCopy, PillPrompt } from './pill-prompt';
import type { QualityWay } from './quality';
import { SaleOffer } from './sale-offer';
import { TouchControls } from './touch-controls';
import { useTouchScreen } from './touch-screen';
import { useAccount } from './use-account';
import { type Walk, walk, type Way } from './walk';

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
  /** The line shown by a closed door the hand would open. */
  door: (typeof COPY)['door'];
  /** A for-sale room's sign, hint and offer. */
  offer: Selling['copy'];
  /** The account's badge and dialog. */
  account: (typeof COPY)['account'];
  /** The hints a touch screen words as taps, in place of the keys'. */
  tapped: (typeof COPY)['tapped'];
  /** What each part of a touch screen does, shown a while on one. */
  controls: (typeof COPY)['controls'];
};

/** The canvas the cube draws into, filling the viewport. */
export function CubeCanvas({
  canvas: label,
  unsupported,
  floor: floorLine,
  nowhere,
  ways,
  pill: pillCopy,
  door: doorCopy,
  offer: offerCopy,
  account: accountCopy,
  tapped,
  controls,
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
  /** Whether the hand would open a closed door. */
  const [door, setDoor] = useState(false);
  /** What a press does where the body stands, a sign in reach aside. */
  const [way, setWay] = useState<Way | QualityWay | null>(null);
  const [pill, setPill] = useState<PillPrompt | null>(null);
  const touch = useTouchScreen();
  /** Whether a touch screen's controls have been shown their while. */
  const [toldControls, setToldControls] = useState(false);
  /** Whether the body answers the controls: awake, and no scene playing. */
  const [free, setFree] = useState(false);
  /** Whether a dialog is open, read by every frame. */
  const offeringRef = useRef(false);
  const [offer, setOffer] = useState<Signed | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const openAccount = () => {
    offeringRef.current = true;
    setAccountOpen(true);
  };
  // Before the walk's effect, which reads the fragment this one may strip.
  const held = useAccount(openAccount);
  const {
    identity,
    wallet: { holdings, balance },
  } = held;
  /** The rooms the player holds, each where its sign hung, read by every mesh build. */
  const holdingsRef = useRef<Holdings>(holdings);
  const sceneRef = useRef<Walk | null>(null);
  /** Counts the browser's steps through history, each a walk from its URL. */
  const [visit, setVisit] = useState(0);
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

  const closeAccount = () => {
    offeringRef.current = false;
    setAccountOpen(false);
  };

  const buy = () => {
    if (offer === null) return;
    const { room, sign } = offer;
    const { at, facing, onPost } = sign;
    buyRoom(roomKey(room), { at, facing, onPost }, priceOf(room.n));
    setOffer({ room, sign: { ...sign, kind: 'yours' } });
  };

  // A login, a logout or a purchase redraws the signs.
  useEffect(() => {
    holdingsRef.current = holdings;
    sceneRef.current?.refresh();
  }, [holdings]);

  /** A question's answer as a button, named by its key or, on a touch screen, by what it does. */
  const answerKey = (said: Said, key: string) => (
    <button
      type="button"
      className={classes['key']}
      onClick={() => {
        sceneRef.current?.answer(said);
      }}
    >
      {key}
    </button>
  );

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
            setDoor,
            setWay: (next) => {
              setWay(sceneRef.current?.hinted(next) ?? next);
            },
            setPill,
            setFree,
            open: (signed) => {
              offeringRef.current = true;
              setOffer(signed);
            },
            offering: () => offeringRef.current,
          },
        );
      })
      .catch(setFailure);
    // Back from a portal's far side leads to where the walk went through it.
    const revisit = (): void => {
      setVisit((count) => count + 1);
    };
    globalThis.addEventListener('popstate', revisit);
    return () => {
      live = false;
      globalThis.removeEventListener('popstate', revisit);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [offerCopy, visit]);

  if (lost) return <p className={classes['notice']}>{nowhere}</p>;
  if (missing) return <p className={classes['notice']}>{unsupported}</p>;
  // A phone has no Shift, so the run's key goes untold on one.
  const hints = touch
    ? {
        ways: { ...ways, ...tapped.ways, run: '' },
        pill: { ...pillCopy, ...tapped.pill },
        door: { ...doorCopy, ...tapped.door },
        offer: { ...offerCopy, ...tapped.offer },
      }
    : { ways, pill: pillCopy, door: doorCopy, offer: offerCopy };
  /** The line for what a press does where no pill is in question. */
  const pressHint =
    inReach === 'yours'
      ? hints.offer.hintYours
      : inReach === null
        ? door
          ? hints.door.open
          : way === null
            ? ''
            : hints.ways[way]
        : hints.offer.hint;
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
        {pill === 'ask'
          ? fillSlots(hints.pill.ask, {
              yes: answerKey('yes', touch ? tapped.answers.yes : 'Y'),
              no: answerKey('no', touch ? tapped.answers.no : 'N'),
            })
          : pill === null
            ? offer === null
              ? pressHint
              : ''
            : hints.pill[pill]}
      </p>
      {touch && !toldControls && free && (
        <TouchControls
          copy={controls}
          onShown={() => {
            setToldControls(true);
          }}
        />
      )}
      {identity !== null && (
        <button
          type="button"
          className={classes['balance']}
          aria-label={accountCopy.balance}
          onClick={openAccount}
        >
          <Cubes count={balance} label={offerCopy.cubes} />
        </button>
      )}
      <SaleOffer
        {...{ offer }}
        balance={identity === null ? null : balance}
        onBuy={buy}
        onClose={closeOffer}
        copy={offerCopy}
      />
      <AccountDialog
        opened={accountOpen}
        {...{ held }}
        copy={accountCopy}
        {...pick(offerCopy, 'cubes')}
        onClose={closeAccount}
      />
    </>
  );
}

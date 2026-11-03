'use client';

import {
  createContext,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useProvided } from '@/kernel/shared/lib/use-provided';
import type {
  Labeled,
  Typed,
  WithChildren,
  WithText,
} from '@/kernel/shared/typings';

import { asTyped, cleanLabel, typedZone } from '../lib/rows';

/** How long typing has to pause before the name is looked up. */
const SETTLE_MS = 350;

/** Counts the lookups asked for, so asking again looks up again. */
type Asked = { asks: number };

/** What is being looked up, and how many times it has been asked for. */
type Query = WithText & Asked;

/** `text` asked for once more, so it is looked up even if unchanged. */
const askedAgain =
  (text: string) =>
  ({ asks }: Query): Query => ({ text, asks: asks + 1 });

/** A name's zone, where one is given. */
export type Zoned = { zone: string | undefined };

/** A name as the field reads it: its label, and the zone typed after it if any. */
export type TypedName = Labeled & Zoned;

/** `label` is the name being looked up — what was typed once typing paused. */
type CheckerState = Typed &
  Asked &
  TypedName & {
    type: (text: string) => void;
    /** Typing has not paused yet: what is shown is not what is typed. */
    settling: boolean;
    /** Looks up what is typed at once, without waiting for typing to pause. */
    checkTyped: () => void;
    /** Puts `name` in the field and looks it up at once, where the field is. */
    checkHere: (name: string) => void;
    /** As `checkHere`, from below the field: scrolls back to the page's top. */
    checkNow: (name: string) => void;
    /** Empties the field and the lookup at once, leaving the caret there. */
    clear: () => void;
    fieldRef: RefObject<HTMLInputElement | null>;
  };

const CheckerContext = createContext<CheckerState | undefined>(undefined);

/**
 * The checker's field, shared with the list below it, whose names drop into
 * the field when clicked.
 */
export function CheckerProvider({ children }: WithChildren) {
  const [typed, setTyped] = useState('');
  const [query, setQuery] = useState<Query>({ text: '', asks: 0 });
  const fieldRef = useRef<HTMLInputElement>(null);
  const linkReadRef = useRef(false);
  const { text, asks } = query;

  const ask = (asked: string) => {
    setQuery(askedAgain(asked));
  };

  useEffect(() => {
    const settle = setTimeout(() => {
      setQuery((current) =>
        current.text === typed ? current : { ...current, text: typed },
      );
    }, SETTLE_MS);

    return () => {
      clearTimeout(settle);
    };
  }, [typed]);

  // A link carrying a name, or a name pasted into the address bar, is looked
  // up at once — the link's own on the tick after hydration, which renders
  // the empty field the static page was built with.
  useEffect(() => {
    const fromHash = () => {
      const name = decodeURIComponent(globalThis.location.hash.slice(1));

      setTyped(name);
      setQuery(askedAgain(name));
    };

    const first = setTimeout(() => {
      linkReadRef.current = true;
      if (globalThis.location.hash !== '') fromHash();
    }, 0);
    globalThis.addEventListener('hashchange', fromHash);

    return () => {
      clearTimeout(first);
      globalThis.removeEventListener('hashchange', fromHash);
    };
  }, []);

  // The field takes the caret on arrival, except on a touch screen, where
  // focusing it raises the keyboard over a page not yet seen.
  useEffect(() => {
    if (!globalThis.matchMedia('(pointer: coarse)').matches) {
      fieldRef.current?.focus();
    }
  }, []);

  const label = cleanLabel(text);
  const zone = typedZone(text);

  // What is looked up stays in the address once typing pauses, so a reload
  // keeps it and a link shares it. Each name is a step in the history, so
  // back and forward walk through them; walking fires `hashchange` above,
  // which looks the name up again. The stats never see it: the root layout's
  // analytics script excludes the hash.
  useEffect(() => {
    const hash = label === '' ? '' : `#${asTyped(label, zone)}`;

    // Until the link is read, the empty field would write over it.
    if (!linkReadRef.current || globalThis.location.hash === hash) return;
    const { pathname, search } = globalThis.location;

    globalThis.history.pushState(null, '', `${pathname}${search}${hash}`);
  }, [label, zone]);

  const checkHere = (name: string) => {
    setTyped(name);
    ask(name);
  };

  const checkNow = (name: string) => {
    checkHere(name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fieldRef.current?.focus({ preventScroll: true });
  };

  return (
    <CheckerContext
      value={{
        typed,
        type: setTyped,
        label,
        zone,
        asks,
        settling: typed !== text,
        checkTyped: () => {
          ask(typed);
        },
        checkHere,
        checkNow,
        clear: () => {
          setTyped('');
          setQuery((current) => ({ ...current, text: '' }));
          fieldRef.current?.focus();
        },
        fieldRef,
      }}
    >
      {children}
    </CheckerContext>
  );
}

export function useChecker(): CheckerState {
  return useProvided(CheckerContext, CheckerProvider);
}

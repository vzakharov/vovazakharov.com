'use client';

import { useLocalStorage } from '@mantine/hooks';
import { createContext, useSyncExternalStore } from 'react';
import { z } from 'zod';

import { useProvided } from '@/kernel/shared/lib/use-provided';
import type { WithChildren } from '@/kernel/shared/typings';

const KEY = 'unsquatted.liked';

/** One reference, since the storage hook re-reads on a new default. */
const NONE: string[] = [];

const Stored = z.array(z.string());

/**
 * The stored list, checked rather than trusted, since anything on the page's
 * origin can write there. A value of another shape is reported and read as
 * empty, so the page still works; the visitor's next like overwrites it.
 */
function deserialize(value: string | undefined): string[] {
  if (value === undefined) return NONE;

  try {
    return Stored.parse(JSON.parse(value));
  } catch (error) {
    reportError(error);

    return NONE;
  }
}

type LikesState = {
  /** Liked domains, in the order they were liked. */
  liked: readonly string[];
  isLiked: (domain: string) => boolean;
  toggle: (domain: string) => void;
  /** Unlikes every one of `domains`. */
  drop: (domains: readonly string[]) => void;
  replace: (liked: readonly string[]) => void;
  /** Whether likes outlast the visit: storage can be blocked. */
  kept: boolean;
};

const LikesContext = createContext<LikesState | undefined>(undefined);

/** Whether the browser lets the page keep anything, asked once per page view. */
let storable: boolean | undefined;

function canStore(): boolean {
  if (storable !== undefined) return storable;
  try {
    globalThis.localStorage.setItem(`${KEY}.probe`, '');
    globalThis.localStorage.removeItem(`${KEY}.probe`);
    storable = true;
  } catch {
    // A private window or blocked site data refuses the write: the answer.
    storable = false;
  }

  return storable;
}

function unsubscribeNothing(): void {
  // Nothing was subscribed to.
}

/** Nothing changes whether storage works while the page is open. */
const unchanging = () => unsubscribeNothing;

/** The static page is built assuming it does, until the browser says. */
const assumed = () => true;

/**
 * The visitor's liked domains, which result cards, listed names and the
 * shortlist all read and change. They are kept in the browser and follow
 * across its open tabs; where it keeps nothing they last the visit, and
 * `kept` says so for the page to tell the visitor.
 */
export function LikesProvider({ children }: WithChildren) {
  const [liked, setLiked] = useLocalStorage<string[]>({
    key: KEY,
    defaultValue: NONE,
    deserialize,
  });
  const kept = useSyncExternalStore(unchanging, canStore, assumed);

  return (
    <LikesContext
      value={{
        liked,
        isLiked: (domain) => liked.includes(domain),
        toggle: (domain) => {
          setLiked((current) =>
            current.includes(domain)
              ? current.filter((each) => each !== domain)
              : [...current, domain],
          );
        },
        drop: (domains) => {
          setLiked((current) =>
            current.filter((each) => !domains.includes(each)),
          );
        },
        replace: (next) => {
          setLiked([...next]);
        },
        kept,
      }}
    >
      {children}
    </LikesContext>
  );
}

export function useLikes(): LikesState {
  return useProvided(LikesContext, LikesProvider);
}

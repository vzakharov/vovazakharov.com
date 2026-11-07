'use client';

import { useLocalStorage } from '@mantine/hooks';
import { createContext, useSyncExternalStore } from 'react';
import { z } from 'zod';

import { useProvided } from '@/kernel/shared/lib/use-provided';
import type { WithChildren } from '@/kernel/shared/typings';

import { asTyped } from '../../checker';
import { deduped, nameOf, withLike } from '../lib/liked';

const KEY = 'unsquatted.liked';

/** One reference, since the storage hook re-reads on a new default. */
const NONE: string[] = [];

const Stored = z.array(z.string());

/**
 * The stored list, checked rather than trusted, since anything on the page's
 * origin can write there, and held to one like per name. A value of another
 * shape is reported and read as empty, so the page still works; the
 * visitor's next like overwrites it.
 */
function deserialize(value: string | undefined): string[] {
  if (value === undefined) return NONE;

  try {
    return deduped(Stored.parse(JSON.parse(value)));
  } catch (error) {
    reportError(error);

    return NONE;
  }
}

type LikesState = {
  /** Liked names, one like each, in the order they were liked. */
  liked: readonly string[];
  /** `name`'s like, if it is liked. */
  likeFor: (name: string) => string | undefined;
  /** Likes `name`, preferring `zone` where one is given. */
  like: (name: string, zone: string | undefined) => void;
  unlike: (name: string) => void;
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
 * The visitor's liked names, which the checker's field and the shortlist read
 * and change. They are kept in the browser and follow across its open tabs;
 * where it keeps nothing they last the visit, and `kept` says so for the page
 * to tell the visitor.
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
        likeFor: (name) => liked.find((each) => nameOf(each) === name),
        like: (name, zone) => {
          setLiked((current) => withLike(current, asTyped(name, zone)));
        },
        unlike: (name) => {
          setLiked((current) =>
            current.filter((each) => nameOf(each) !== name),
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

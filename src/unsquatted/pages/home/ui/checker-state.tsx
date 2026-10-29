'use client';

import {
  createContext,
  type RefObject,
  use,
  useEffect,
  useRef,
  useState,
} from 'react';

import type { WithChildren } from '@/kernel/shared/typings';

import { cleanLabel } from '../lib/lookup';

/** How long typing has to pause before the name is looked up. */
const SETTLE_MS = 350;

type CheckerState = {
  typed: string;
  type: (text: string) => void;
  /** The label being looked up — what was typed once typing paused. */
  label: string;
  /** Puts `name` in the field and looks it up at once, the field in view. */
  checkNow: (name: string) => void;
  fieldRef: RefObject<HTMLInputElement | null>;
};

const CheckerContext = createContext<CheckerState | undefined>(undefined);

/**
 * The checker's field, shared with the list below it, whose names drop into
 * the field when clicked.
 */
export function CheckerProvider({ children }: WithChildren) {
  const [typed, setTyped] = useState('');
  const [label, setLabel] = useState('');
  const fieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const settle = setTimeout(() => {
      setLabel(cleanLabel(typed));
    }, SETTLE_MS);

    return () => {
      clearTimeout(settle);
    };
  }, [typed]);

  const checkNow = (name: string) => {
    setTyped(name);
    setLabel(cleanLabel(name));
    fieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    fieldRef.current?.focus({ preventScroll: true });
  };

  return (
    <CheckerContext
      value={{ typed, type: setTyped, label, checkNow, fieldRef }}
    >
      {children}
    </CheckerContext>
  );
}

export function useChecker(): CheckerState {
  const state = use(CheckerContext);

  if (state === undefined) {
    throw new Error('useChecker is called outside a CheckerProvider');
  }

  return state;
}

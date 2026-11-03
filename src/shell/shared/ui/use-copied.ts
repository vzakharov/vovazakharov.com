'use client';

import { useEffect, useEffectEvent, useState } from 'react';

/** How long a control says it copied before it reads as itself again. */
const COPIED_MS = 2000;

type Copied = {
  /** Whether the last copy landed within the past `COPIED_MS`. */
  copied: boolean;
  /** Puts `text` on the clipboard; a refusal is reported, never shown as copied. */
  copy: (text: string) => void;
};

/**
 * A clipboard write whose control says so for a moment. `onDone` runs when
 * the moment ends, for a control that goes away with it.
 */
export function useCopied(onDone?: () => void): Copied {
  const [copied, setCopied] = useState(false);
  const done = useEffectEvent(() => {
    setCopied(false);
    onDone?.();
  });

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(done, COPIED_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [copied]);

  return {
    copied,
    copy: (text) => {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
      }, reportError);
    },
  };
}

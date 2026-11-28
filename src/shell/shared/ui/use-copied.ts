'use client';

import { useEffect, useEffectEvent, useState } from 'react';

/** How long a control says it copied before it reads as itself again. */
const COPIED_MS = 2000;

/**
 * A blob still being made, of a type known already. Handed to the clipboard
 * inside the click, it may settle later: Safari takes a write only from inside
 * the click that asked for it, and a promise is how a slow blob stays inside.
 */
type BlobToBe = Pick<Blob, 'type'> & { made: Promise<Blob> };

type Copyable = string | Blob | BlobToBe;

type Copied = {
  /** Whether the last copy landed within the past moment. */
  copied: boolean;
  /**
   * Puts `content` on the clipboard, a blob as its own type; a refusal, or a
   * blob that fails to be made, is reported, never shown as copied.
   */
  copy: (content: Copyable) => void;
};

const written = async (content: Copyable) =>
  typeof content === 'string'
    ? navigator.clipboard.writeText(content)
    : navigator.clipboard.write([
        new ClipboardItem({
          [content.type]: content instanceof Blob ? content : content.made,
        }),
      ]);

/**
 * A clipboard write whose control says so for a moment, `ms` long. `onDone`
 * runs when the moment ends, for a control that goes away with it.
 */
export function useCopied(onDone?: () => void, ms = COPIED_MS): Copied {
  const [copied, setCopied] = useState(false);
  const done = useEffectEvent(() => {
    setCopied(false);
    onDone?.();
  });

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(done, ms);

    return () => {
      clearTimeout(timer);
    };
  }, [copied, ms]);

  return {
    copied,
    copy: (content) => {
      written(content).then(() => {
        setCopied(true);
      }, reportError);
    },
  };
}

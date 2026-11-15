import { useEffect, useState } from 'react';

import COPY from '../config/messages/en.json';
import type { Copied, Panel } from './diagnostics';
import classes from './island.module.scss';

/** How long the button says the link is copied. */
const CONFIRM_MS = 1800;

/**
 * The diagnostics rows and a button copying the view's share link. The button
 * says so once copied; a refused copy stays up with the clipboard's error and
 * the link, selectable, until the next press.
 */
export function DiagnosticsPanel({ rows, copyLink }: Panel) {
  // Each copy is a fresh object, so a second press restarts the confirmation.
  const [copied, setCopied] = useState<Copied | null>(null);
  const [failure, setFailure] = useState<Error | null>(null);
  // Thrown while rendering, so the route's error boundary shows it.
  if (failure !== null) throw failure;

  useEffect(() => {
    if (copied?.ok !== true) return;
    const hide = setTimeout(() => {
      setCopied(null);
    }, CONFIRM_MS);
    return () => {
      clearTimeout(hide);
    };
  }, [copied]);

  const copy = () => {
    // `copyLink` never rejects: a refused copy resolves with its error.
    copyLink().then(setCopied, (error: unknown) => {
      setFailure(error instanceof Error ? error : new Error(String(error)));
    });
  };

  return (
    <section
      className={classes['diagnostics']}
      aria-label={COPY.diagnostics.label}
    >
      <pre className={classes['diagnosticsRows']}>{rows.join('\n')}</pre>
      <button
        type="button"
        className={classes['diagnosticsCopy']}
        onClick={copy}
      >
        {copied === null
          ? COPY.diagnostics.copy
          : copied.ok
            ? COPY.diagnostics.copied
            : COPY.diagnostics.failed}
      </button>
      <output className={classes['diagnosticsFailure']} aria-live="polite">
        {copied === null || copied.ok
          ? null
          : `${copied.link}\n(${copied.error.message})`}
      </output>
    </section>
  );
}

import { useEffect, useState } from 'react';

import COPY from '../config/messages/en.json';
import type { Copied, Panel } from './diagnostics';
import classes from './island.module.scss';

/** How long the button says the link is copied. */
const CONFIRM_MS = 1800;

/** Where a measurement stands: not run, on a reading, or done with its table. */
type Measured =
  | { readonly step: string }
  | { readonly table: string; readonly copied: boolean };

/**
 * The diagnostics rows, a button copying the view's share link and one
 * measuring what each of `?without=`'s costs takes. The copy button says so
 * once copied; a refused copy stays up with the clipboard's error and the
 * link, selectable, until the next press. The measurement's table stays up,
 * selectable, with a button copying it.
 */
export function DiagnosticsPanel({ rows, copyLink, measure }: Panel) {
  // Each copy is a fresh object, so a second press restarts the confirmation.
  const [copied, setCopied] = useState<Copied | null>(null);
  const [measured, setMeasured] = useState<Measured | null>(null);
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

  const fail = (error: unknown) => {
    setFailure(error instanceof Error ? error : new Error(String(error)));
  };

  const copy = () => {
    // `copyLink` never rejects: a refused copy resolves with its error.
    copyLink().then(setCopied, fail);
  };

  const running = measured !== null && 'step' in measured;
  const start = () => {
    if (running) return;
    setMeasured({ step: '' });
    measure((step) => {
      setMeasured({ step });
    }).then((table) => {
      setMeasured({ table, copied: false });
    }, fail);
  };

  const copyTable = (table: string) => {
    navigator.clipboard.writeText(table).then(() => {
      setMeasured({ table, copied: true });
    }, fail);
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
      <button
        type="button"
        className={classes['diagnosticsCopy']}
        onClick={start}
        disabled={running}
      >
        {running
          ? `${COPY.diagnostics.measuring} ${measured.step}`
          : COPY.diagnostics.measure}
      </button>
      {measured !== null && 'table' in measured && (
        <>
          <pre className={classes['diagnosticsTable']}>{measured.table}</pre>
          <button
            type="button"
            className={classes['diagnosticsCopy']}
            onClick={() => {
              copyTable(measured.table);
            }}
          >
            {measured.copied
              ? COPY.diagnostics.tableCopied
              : COPY.diagnostics.copyTable}
          </button>
        </>
      )}
    </section>
  );
}

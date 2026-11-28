import { useEffect, useState } from 'react';

import COPY from '../config/messages/en.json';
import type { Copied, Panel } from './diagnostics';
import classes from './island.module.scss';

/** How long a button says its text is copied. */
const CONFIRM_MS = 1800;

/** How the last copy went, the confirmation hidden after `CONFIRM_MS`. */
function useCopied() {
  // Each copy is a fresh object, so a second press restarts the confirmation.
  const [copied, setCopied] = useState<Copied | null>(null);
  useEffect(() => {
    if (copied?.ok !== true) return;
    const hide = setTimeout(() => {
      setCopied(null);
    }, CONFIRM_MS);
    return () => {
      clearTimeout(hide);
    };
  }, [copied]);
  return [copied, setCopied] as const;
}

/**
 * The diagnostics rows, a button copying the view's share link and one
 * measuring what each look and each of `?without=`'s costs takes. A copy
 * button says so once copied; a refused copy stays up with the clipboard's
 * error and the text, selectable, until the next press. The measurement's
 * table stays up, selectable, with a button copying it.
 */
export function DiagnosticsPanel({
  rows,
  copyLink,
  measured,
  measure,
  copyTable,
}: Panel) {
  const [copied, setCopied] = useCopied();
  const [tableCopied, setTableCopied] = useCopied();
  const [failure, setFailure] = useState<Error | null>(null);
  // Thrown while rendering, so the route's error boundary shows it.
  if (failure !== null) throw failure;
  if (measured !== null && 'error' in measured) throw measured.error;

  const fail = (error: unknown) => {
    setFailure(error instanceof Error ? error : new Error(String(error)));
  };
  const refused = [copied, tableCopied]
    .flatMap((one) =>
      one === null || one.ok ? [] : [`${one.text}\n(${one.error.message})`],
    )
    .join('\n');
  const running = measured !== null && 'step' in measured;

  return (
    <section
      className={classes['diagnostics']}
      aria-label={COPY.diagnostics.label}
    >
      <pre className={classes['diagnosticsRows']}>{rows.join('\n')}</pre>
      <button
        type="button"
        className={classes['diagnosticsCopy']}
        onClick={() => {
          // `copyLink` never rejects: a refused copy resolves with its error.
          copyLink().then(setCopied, fail);
        }}
      >
        {copied === null
          ? COPY.diagnostics.copy
          : copied.ok
            ? COPY.diagnostics.copied
            : COPY.diagnostics.failed}
      </button>
      <button
        type="button"
        className={classes['diagnosticsCopy']}
        onClick={measure}
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
              copyTable(measured.table).then(setTableCopied, fail);
            }}
          >
            {tableCopied === null
              ? COPY.diagnostics.copyTable
              : tableCopied.ok
                ? COPY.diagnostics.tableCopied
                : COPY.diagnostics.failed}
          </button>
        </>
      )}
      <output className={classes['diagnosticsFailure']} aria-live="polite">
        {refused === '' ? null : refused}
      </output>
    </section>
  );
}

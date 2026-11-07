import type { Status } from '../model/store.ts';

function statusText(next: Status): string {
  switch (next.kind) {
    case 'read-only': {
      return next.reason;
    }
    case 'connecting': {
      return 'Connecting…';
    }
    case 'live': {
      return next.rejected.length > 0
        ? `Live — unreadable rows: ${next.rejected.join(', ')}`
        : 'Live';
    }
    case 'stale': {
      return 'Live edits can’t be reached yet; this may be out of date.';
    }
    case 'error': {
      return next.message;
    }
    default: {
      const unknown: never = next;
      throw new Error(`unknown status ${JSON.stringify(unknown)}`);
    }
  }
}

/** Takes the status node rather than the board: the first status arrives while the board's store is still being made. */
export function showStatus(node: HTMLElement, next: Status): void {
  node.textContent = statusText(next);
  node.dataset['kind'] = next.kind;
  document.body.classList.toggle('read-only', next.kind === 'read-only');
}

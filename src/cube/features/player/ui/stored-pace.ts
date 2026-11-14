const KEY = 'cube.runsUnheld';

const STORED_PACES = new Map([
  ['run', true],
  ['walk', false],
]);

/**
 * The pace this browser's body last stood at — whether it runs with no Shift
 * held — or null where none was stored or it cannot be read. Memory is the
 * pace's truth and storage only its copy, so a browser refusing storage — a
 * private window, blocked site data — walks as on a first visit.
 */
export function storedRunsUnheld(): boolean | null {
  try {
    return STORED_PACES.get(localStorage.getItem(KEY) ?? '') ?? null;
  } catch {
    // Storage refused: the body walks, as on a first visit.
    return null;
  }
}

/** Keeps `runsUnheld` for this browser's next visit, where it may. */
export function storeRunsUnheld(runsUnheld: boolean): void {
  try {
    localStorage.setItem(KEY, runsUnheld ? 'run' : 'walk');
  } catch {
    // Storage refused: the pace still holds for this visit.
  }
}

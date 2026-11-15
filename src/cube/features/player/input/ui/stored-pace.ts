const KEY = 'cube.runsUnheld';

const STORED_PACES = new Map([
  ['run', true],
  ['walk', false],
]);

/**
 * Whether this browser's body last ran with no Shift held, or null where none
 * was stored or storage is refused (a private window, blocked site data).
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

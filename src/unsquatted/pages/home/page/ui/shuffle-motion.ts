/**
 * The dice's motion over the list's rows, each found by its `data-domain`: the
 * rows going fly off to the left, the rows coming run in from the right, and a
 * row both draws hold slides from its old place to its new one.
 */

/** How far a row flies, as a share of its own width. */
const FLIGHT = '30%';
const EASE_OUT = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
const EASE_IN = 'cubic-bezier(0.4, 0, 1, 1)';
const LEAVE_MS = 200;
const ARRIVE_MS = 320;
const MOVE_MS = 320;
const STAGGER_MS = 30;

export type RowTops = ReadonlyMap<string, number>;

function rows(list: HTMLElement) {
  return [...list.querySelectorAll<HTMLElement>('[data-domain]')].map(
    (row) => ({ row, domain: row.dataset['domain'] ?? '' }),
  );
}

export function prefersStillness() {
  return globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Flies the rows not in `staying` off to the left, one after another, and
 * calls `gone` once the last has landed. Timed rather than awaited, so a
 * flight cut short never holds the redraw back.
 */
export function leave(
  list: HTMLElement,
  staying: ReadonlySet<string>,
  gone: () => void,
) {
  const going = rows(list).filter(({ domain }) => !staying.has(domain));

  for (const [index, { row }] of going.entries()) {
    row.animate(
      [
        { transform: 'none', opacity: 1 },
        { transform: `translateX(-${FLIGHT})`, opacity: 0 },
      ],
      {
        duration: LEAVE_MS,
        delay: index * STAGGER_MS,
        easing: EASE_IN,
        fill: 'forwards',
      },
    );
  }

  setTimeout(gone, LEAVE_MS + Math.max(0, going.length - 1) * STAGGER_MS);
}

/** Each row's top on screen, read before the list changes. */
export function rowTops(list: HTMLElement): RowTops {
  return new Map(
    rows(list).map(({ row, domain }) => [
      domain,
      row.getBoundingClientRect().top,
    ]),
  );
}

/**
 * After the list changed: a row `before` places slides from there to here,
 * and the others run in from the right, in turn down the list.
 */
export function arrive(list: HTMLElement, before: RowTops) {
  let coming = 0;

  for (const { row, domain } of rows(list)) {
    const top = before.get(domain);

    if (top === undefined) {
      row.animate(
        [
          { transform: `translateX(${FLIGHT})`, opacity: 0 },
          { transform: 'none', opacity: 1 },
        ],
        {
          duration: ARRIVE_MS,
          delay: coming++ * STAGGER_MS,
          easing: EASE_OUT,
          fill: 'backwards',
        },
      );
    } else {
      const shift = top - row.getBoundingClientRect().top;
      if (shift !== 0) {
        row.animate(
          [{ transform: `translateY(${shift}px)` }, { transform: 'none' }],
          { duration: MOVE_MS, easing: EASE_OUT },
        );
      }
    }
  }
}

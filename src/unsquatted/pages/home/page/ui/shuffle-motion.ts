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
 * Flies the rows not in `staying` off from a copy of the list laid over it, so
 * the list itself can change at once and its new rows arrive while the old
 * ones are still leaving. The copy sits on `<body>`, out of React's tree, and
 * is removed on a timer once the last row has flown.
 */
export function leave(list: HTMLElement, staying: ReadonlySet<string>) {
  const { left, top, width } = list.getBoundingClientRect();
  const ghost = list.cloneNode(true);
  if (!(ghost instanceof HTMLElement))
    throw new TypeError('a list clones as an element');

  ghost.removeAttribute('aria-live');
  ghost.setAttribute('aria-hidden', 'true');
  Object.assign(ghost.style, {
    position: 'absolute',
    left: `${left + globalThis.scrollX}px`,
    top: `${top + globalThis.scrollY}px`,
    width: `${width}px`,
    margin: '0',
    borderTopColor: 'transparent',
    pointerEvents: 'none',
  });
  document.body.append(ghost);

  const all = rows(ghost);
  for (const { row, domain } of all) {
    if (staying.has(domain)) row.style.visibility = 'hidden';
  }
  const going = all.filter(({ domain }) => !staying.has(domain));

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

  setTimeout(
    () => {
      ghost.remove();
    },
    LEAVE_MS + Math.max(0, going.length - 1) * STAGGER_MS,
  );
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

/** Runs once the list has changed, against the places `rowTops` read before. */
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

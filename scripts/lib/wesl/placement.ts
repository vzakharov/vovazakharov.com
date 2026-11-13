/**
 * Where a shader import may reach, by the rules `.claude/rules/masd.md` holds
 * TypeScript imports to: an app reaches itself and its ancestors, a layer only
 * the layers below it, and a slice or sub-slice is entered from outside by its
 * barrel. Files are classified by `eslint/masd-graph.ts` and
 * `scripts/lib/slice-graph.ts`, the same readers the TypeScript checkers use.
 */

import path from 'node:path';

import {
  ancestors,
  LAYERS,
  type MasdGraph,
  SLICED_LAYERS,
} from '../../../eslint/masd-graph.ts';
import { sliceOf, unitsOf } from '../slice-graph.ts';

/**
 * The units a file sits in, outermost first: its slice and sub-slices in a
 * sliced layer, its segment in `app` or `shared`.
 */
function unitChain(file: string): string[] {
  const slice = sliceOf(file);
  if (slice !== undefined) return unitsOf(file, slice);
  return [file.split(path.sep).slice(0, 4).join(path.sep)];
}

/** How an allowed import enters its target. */
type Entry = {
  /**
   * The unit whose barrel it goes through, or `undefined` when the target
   * shares the importer's unit and is reached directly.
   */
  barrel: string | undefined;
  /**
   * When `barrel` is a sub-slice beside one the importer sits in, that
   * sub-slice of the importer's: the one now reaching a sibling.
   */
  sibling: string | undefined;
};

export type Entered = { entry: Entry };

export type Placement = Entered & { errors: string[] };

/**
 * Whether `importer` may import `target`, both paths from the repository root,
 * written as `supers` (`super::`) or as a `package::` path (`undefined`).
 */
export function placeImport(
  graph: MasdGraph,
  importer: string,
  target: string,
  supers: number | undefined,
): Placement {
  const errors: string[] = [];
  const [, fromApp = '', fromLayer = ''] = importer.split(path.sep);
  const [, toApp = '', toLayer = ''] = target.split(path.sep);
  if (fromApp !== toApp && !ancestors(graph, fromApp).has(toApp)) {
    errors.push(`${toApp} is not ${fromApp} or an app it inherits`);
  }
  const height = LAYERS.indexOf(fromLayer) - LAYERS.indexOf(toLayer);
  if (height > 0) {
    errors.push(`${toLayer} sits above ${fromLayer}`);
  } else if (
    height === 0 &&
    SLICED_LAYERS.includes(toLayer) &&
    sliceOf(importer) !== sliceOf(target)
  ) {
    errors.push(`${sliceOf(target) ?? target} is a sibling slice`);
  }

  const outer = unitChain(importer);
  const inner = unitChain(target);
  const depth = inner.findIndex((unit) => !outer.includes(unit));
  const entered = depth === -1 ? undefined : inner[depth];
  // A `shared/lib` segment has no root barrel: each top-level file in it is
  // its own public API, entered directly.
  const subLibrary =
    entered?.endsWith(`${path.sep}shared${path.sep}lib`) === true &&
    path.dirname(target) === entered;
  const barrel = subLibrary ? undefined : entered;
  const besideOwn =
    barrel !== undefined && depth > 0 && outer.includes(inner[depth - 1] ?? '');
  const sibling = besideOwn ? outer[depth] : undefined;

  if (barrel === undefined && !subLibrary && supers === undefined) {
    errors.push('a module in the same unit is imported by super::');
  }
  if (barrel !== undefined && supers !== undefined) {
    errors.push(`${barrel} is entered by a package:: path to its barrel`);
  }
  return { errors, entry: { barrel, sibling } };
}

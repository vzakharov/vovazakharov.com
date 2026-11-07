/**
 * A board split by zone, so no file outgrows the repo's line limit: the
 * board's own file (`docs/boards/island.yaml`) holds its title, its artifact
 * and every item no zone holds, and each zone keeps itself and what lies in it
 * in `<the board's directory>/<zone id less "z-">.yaml`, beside the images.
 *
 * Which file an item lives in is derived from the board, never chosen: a zone
 * is its own; a sticky, image or text goes to the smallest live zone its top
 * edge's midpoint lies in; a line goes with the item it starts from; a deleted
 * item stays where it was. Every write re-derives it for every item, so a card
 * dragged into another zone moves file with it.
 */
import path from 'node:path';

import type { Item } from '@/island-board/entities/item';

import {
  assertUnique,
  decodeBoard,
  type FileKind,
  removeItems,
  writeItems,
} from './board-file.ts';

/** File path → its text. A zone file never empties: its zone is always in it, as a tombstone once deleted. */
export type BoardFiles = ReadonlyMap<string, string>;

const EMPTY_ZONE = 'items: []\n';

/** Where a board's zone files and images sit: `island.yaml`'s are in `island/`. */
export const boardDir = (board: string): string =>
  path.join(path.dirname(board), path.basename(board, '.yaml'));

const zoneFile = (board: string, zoneId: string): string =>
  path.join(boardDir(board), `${zoneId.replace(/^z-/, '')}.yaml`);

const kindOf = (board: string, file: string): FileKind =>
  file === board ? 'board' : 'zone';

/** Every live item, each with the file it is read from. */
function located(
  board: string,
  files: BoardFiles,
): { items: Item[]; fileOf: Map<string, string> } {
  const items: Item[] = [];
  const fileOf = new Map<string, string>();
  for (const [file, text] of files) {
    for (const item of decodeBoard(text, kindOf(board, file))) {
      items.push(item);
      fileOf.set(item.id, file);
    }
  }
  assertUnique(items);
  return { items, fileOf };
}

export const decodeBoardFiles = (board: string, files: BoardFiles): Item[] =>
  located(board, files).items;

type Zone = Extract<Item, { kind: 'zone' }>;

const contains = (zone: Zone, x: number, y: number): boolean =>
  x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h;

/** The file `item` belongs in, read off `items` as the header says. */
export function homeOf(
  board: string,
  item: Item,
  items: readonly Item[],
  current: string | undefined,
  seen: ReadonlySet<string> = new Set(),
): string {
  if (item.deleted === true) return current ?? board;
  switch (item.kind) {
    case 'zone': {
      return zoneFile(board, item.id);
    }
    case 'line': {
      const from = items.find((other) => other.id === item.from);
      // A line's end may be another line; `seen` stops a pair that loops.
      if (from === undefined || seen.has(from.id)) return board;
      return homeOf(board, from, items, undefined, new Set([...seen, item.id]));
    }
    case 'sticky':
    case 'image':
    case 'text': {
      const x = item.x + (item.w ?? 0) / 2;
      const zones = items.filter(
        (other): other is Zone =>
          other.kind === 'zone' &&
          other.deleted !== true &&
          contains(other, x, item.y),
      );
      const smallest = zones.toSorted((a, b) => a.w * a.h - b.w * b.h)[0];
      return smallest === undefined ? board : zoneFile(board, smallest.id);
    }
    default: {
      const unknown: never = item;
      throw new Error(`unknown item ${JSON.stringify(unknown)}`);
    }
  }
}

/**
 * `changed` written into the board's files, every item then moved to the file
 * `homeOf` names. Returns every file whose text changes.
 */
export function writeBoardFiles(
  board: string,
  files: BoardFiles,
  changed: readonly Item[],
): Map<string, string> {
  const { items, fileOf } = located(board, files);
  const byId = new Map(items.map((item) => [item.id, item]));
  for (const item of changed) byId.set(item.id, item);
  // Zones first, so a zone's file opens on the zone it is named for.
  const merged = [...byId.values()].toSorted(
    (a, b) => Number(b.kind === 'zone') - Number(a.kind === 'zone'),
  );
  const changedIds = new Set(changed.map((item) => item.id));

  const removals = new Map<string, Set<string>>();
  const writes = new Map<string, Item[]>();
  for (const item of merged) {
    const current = fileOf.get(item.id);
    const home = homeOf(board, item, merged, current);
    const moved = current !== undefined && current !== home;
    if (moved)
      removals.set(
        current,
        new Set([...(removals.get(current) ?? []), item.id]),
      );
    if (moved || changedIds.has(item.id))
      writes.set(home, [...(writes.get(home) ?? []), item]);
  }

  const out = new Map<string, string>();
  for (const file of new Set([...removals.keys(), ...writes.keys()])) {
    const gone = removals.get(file);
    const kept = files.get(file) ?? EMPTY_ZONE;
    out.set(
      file,
      writeItems(
        gone === undefined ? kept : removeItems(kept, gone),
        writes.get(file) ?? [],
      ),
    );
  }
  return out;
}

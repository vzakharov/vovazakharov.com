/**
 * Carries the island board's old one-JSON-per-item cards into its YAML files,
 * for cards the lead wrote in the old format before #258 merged. Deleted with
 * this directory at `/finalize`: once #258 is in, no card is written as JSON.
 *
 *   pnpm tsx docs/remove-before-merging/island/review-1/import-items.ts \
 *     <items dir> <images dir> <board.yaml>
 *
 * Each `<id>.json` must parse as an `Item`; only a card newer than the board's
 * copy, or absent from it, is written — through `writeBoardFiles`, so it lands
 * in the file its zone names. An image card's file is copied from
 * `<images dir>` beside the board's other images.
 */
import { copyFile, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { format, resolveConfig } from 'prettier';

import { Item, newerThan } from '@/island-board/entities/item';

import {
  boardDir,
  decodeBoardFiles,
  writeBoardFiles,
} from '@/island-board/scripts/lib/board-files.ts';

const [itemsDir, imagesDir, boardArg] = process.argv.slice(2);
if (itemsDir === undefined || imagesDir === undefined || boardArg === undefined)
  throw new Error(
    'usage: import-items.ts <items dir> <images dir> <board.yaml>',
  );
const board = path.resolve(boardArg);

const zones = (await readdir(boardDir(board)))
  .filter((name) => name.endsWith('.yaml'))
  .toSorted()
  .map((name) => path.join(boardDir(board), name));
const paths = [board, ...zones];
const files = new Map(
  await Promise.all(
    paths.map(async (file) => [file, await readFile(file, 'utf8')] as const),
  ),
);

const cards = await Promise.all(
  (await readdir(itemsDir))
    .filter((name) => name.endsWith('.json'))
    .toSorted()
    .map(async (name) =>
      Item.parse(JSON.parse(await readFile(path.join(itemsDir, name), 'utf8'))),
    ),
);
const changed = newerThan(decodeBoardFiles(board, files), cards);

await Promise.all(
  changed.map(async (card) => {
    if (card.kind !== 'image') return;
    const name = path.basename(card.src);
    await copyFile(
      path.join(imagesDir, name),
      path.join(boardDir(board), name),
    );
  }),
);

const written = writeBoardFiles(board, files, changed);
await Promise.all(
  [...written].map(async ([file, text]) => {
    const options = { ...(await resolveConfig(file)), filepath: file };
    await writeFile(file, await format(text, options), 'utf8');
  }),
);
process.stdout.write(
  `${cards.length} cards, ${changed.length} newer: ${changed.map((card) => card.id).join(', ') || 'none'}\n` +
    `${written.size} files written: ${[...written.keys()].map((file) => path.relative(process.cwd(), file)).join(', ') || 'none'}\n`,
);

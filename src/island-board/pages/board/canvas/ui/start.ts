/**
 * The board page: an infinite canvas of the items baked into it, overlaid live
 * with the artifact's `db` rows.
 */
import { z } from 'zod';

import { Item } from '@/island-board/entities/item';

import { type Capabilities, connect } from '../api/runtime.ts';
import { byId, required } from '../lib/dom.ts';
import type { Board } from '../model/board.ts';
import { createStore } from '../model/store.ts';
import { wireControls } from './controls.ts';
import { wireGestures } from './gestures.ts';
import { showStatus } from './status.ts';
import { render } from './view.ts';
import { fit } from './viewport.ts';

function boardOnPage(): Board {
  const status = byId('status');
  const baked = z.array(Item).parse(JSON.parse(byId('board-data').textContent));
  const board: Board = {
    stage: byId('stage'),
    world: byId('world'),
    lines: required(document.querySelector<SVGSVGElement>('#lines'), '#lines'),
    status,
    colors: byId('colors'),
    picker: required(
      document.querySelector<HTMLInputElement>('#image-file'),
      '#image-file',
    ),
    baked,
    camera: { x: 0, y: 0, zoom: 1 },
    selected: undefined,
    lineTool: false,
    lineFrom: undefined,
    editing: undefined,
    names: {},
    user: null,
    assets: null,
    store: createStore(
      baked,
      undefined,
      () => {
        render(board);
      },
      (next) => {
        showStatus(status, next);
      },
    ),
  };
  return board;
}

/** Drawn and fitted once every image has settled; a broken one shows as one. */
async function drawBaked(board: Board): Promise<void> {
  document.body.classList.toggle('snapshot', location.hash === '#snapshot');
  render(board);
  fit(board);
  showStatus(board.status, { kind: 'read-only', reason: 'Read-only copy.' });
  await Promise.allSettled(
    [...document.images].map(async (img) => img.decode()),
  );
  render(board);
  fit(board);
}

type Live = Capabilities & {
  /** The viewer's id, when the runtime names one. */
  author: string | null;
  /** Whether the viewer may write, when the runtime says. */
  allowed: boolean | null;
};

async function live(): Promise<Live> {
  const capabilities = await connect();
  const { user } = capabilities;
  return {
    ...capabilities,
    author: (await user?.id()) ?? null,
    allowed: (await user?.can('data.write')) ?? null,
  };
}

/** The board taken live: its store overlaid with the db rows, where the viewer may write them. */
function goLive(
  board: Board,
  { db, user, assets, author, allowed }: Live,
): void {
  Object.assign(board, { user, assets });
  document.body.classList.toggle('can-upload', assets !== null);
  board.store = createStore(
    board.baked,
    db !== null && author !== null && allowed !== false
      ? { db, author }
      : undefined,
    () => {
      render(board);
    },
    (next) => {
      showStatus(board.status, next);
    },
  );
  render(board);
}

/** Draws the baked board read-only, then connects to the artifact's runtime and goes live where it may write. */
export async function startBoard(): Promise<void> {
  const board = boardOnPage();
  wireGestures(board);
  wireControls(board);
  await drawBaked(board);
  document.body.dataset['ready'] = 'true';
  goLive(board, await live());
}

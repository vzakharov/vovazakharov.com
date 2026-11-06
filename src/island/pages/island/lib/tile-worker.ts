/**
 * The tile worker: builds the coast field once, on `init`, then fills each
 * tile it is sent and posts it back with its buffers transferred. Messages
 * are handled in order, so every fill waits for the field.
 */
import { coast } from '@/island/entities/coast';
import {
  buildCoastField,
  type CoastField,
  fillTile,
  heightAt,
  TILE_GRID,
  type TileKey,
} from '@/island/entities/terrain';

import { landColours } from './land-colour';
import {
  filledBuffers,
  type FilledTile,
  SEED,
  type WorkerReply,
  type WorkerRequest,
} from './tile-protocol';

let field: CoastField | null = null;

const reply = (message: WorkerReply, transfer: Transferable[] = []) => {
  postMessage(message, { transfer });
};

/** The grid's own heights, the skirt's left out, at their lowest and highest. */
function gridRange(heights: Float32Array): readonly [number, number] {
  let low = Infinity;
  let high = -Infinity;
  for (const height of heights.subarray(0, TILE_GRID * TILE_GRID)) {
    low = Math.min(low, height);
    high = Math.max(high, height);
  }
  return [low, high];
}

function fill(built: CoastField, key: TileKey): FilledTile {
  const start = performance.now();
  const ground = fillTile(key, (x, y) => heightAt(built, SEED, x, y));
  const [low, high] = gridRange(ground.heights);
  return {
    key,
    land:
      high < 0 ? null : { ...ground, colours: landColours(ground.heights) },
    sea: low > 0 ? null : fillTile(key, () => 0),
    fillMs: performance.now() - start,
  };
}

addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  if (request.kind === 'init') {
    const start = performance.now();
    field = buildCoastField(coast);
    // A copy, not a transfer: this worker keeps filling from its own.
    reply({
      kind: 'built',
      buildMs: performance.now() - start,
      field: request.sendField ? field : null,
    });
    return;
  }
  if (field === null) throw new Error('tile worker: fill before init');
  const tile = fill(field, request.key);
  reply({ kind: 'tile', tile }, filledBuffers(tile));
});

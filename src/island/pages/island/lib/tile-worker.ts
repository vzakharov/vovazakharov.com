/**
 * The tile worker: builds the world's field once, on `init`, from the world
 * number alone, then fills each tile it is sent and posts it back with its
 * buffers transferred. Messages are handled in order, so every fill waits for
 * the field.
 */
import type { GridCell, Vec3 } from '@/island/shared/globe';
import {
  buildWorldField,
  detailCut,
  fillTile,
  heightAt,
  TILE_GRID,
  worldSeed,
} from '@/island/entities/terrain';

import {
  filledBuffers,
  type FilledTile,
  type WorkerReply,
  type WorkerRequest,
  type WorldField,
} from './tile-protocol';

let world: WorldField | null = null;

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

function fill(
  { field, seed }: WorldField,
  key: GridCell,
  eye: Vec3,
): FilledTile {
  const start = performance.now();
  const ground = fillTile(
    key,
    (x, y, finest) => heightAt(field, seed, x, y, finest),
    { finest: detailCut(eye, field) },
  );
  const [low, high] = gridRange(ground.heights);
  const land = high < 0 ? null : ground;
  const sea = low > 0 ? null : fillTile(key, () => 0);
  // Its own buffer when the land goes too, since a buffer transfers once.
  const floor =
    land === null ? ground.heights : new Float32Array(ground.heights);
  return {
    key,
    land,
    sea,
    floor: sea === null ? null : floor,
    fillMs: performance.now() - start,
  };
}

addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  if (request.kind === 'init') {
    const start = performance.now();
    const field = buildWorldField(request.world);
    const seed = worldSeed(request.world);
    world = { field, seed };
    // A copy, not a transfer: this worker keeps filling from its own.
    reply({
      kind: 'built',
      buildMs: performance.now() - start,
      field: request.sendField ? field : null,
      seed,
    });
    return;
  }
  if (world === null) throw new Error('tile worker: fill before init');
  const tile = fill(world, request.key, request.eye);
  reply({ kind: 'tile', tile }, filledBuffers(tile));
});

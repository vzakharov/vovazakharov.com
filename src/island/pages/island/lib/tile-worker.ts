/**
 * The tile worker: builds the world's field once, on `init`, from the world
 * number alone (its pinned row, if it has one), then fills each tile it is
 * sent and posts it back with its buffers transferred. The build is async, so
 * a fill that arrives before it waits for it; fills still go back in the order
 * they came.
 */
import type { CubeCell, Vec3 } from '@/island/shared/globe';
import {
  cubeDetailCut,
  fillCubeTile,
  heightAtSphere,
  openSphereWorld,
  sampleSphereField,
  TILE_GRID,
} from '@/island/entities/terrain';

import {
  filledBuffers,
  type FilledTile,
  type WorkerReply,
  type WorkerRequest,
  type WorldField,
} from './tile-protocol';

let world: Promise<WorldField> | null = null;

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
  key: CubeCell,
  eye: Vec3,
): FilledTile {
  const start = performance.now();
  const distance = (p: Vec3) => sampleSphereField(field, p);
  const ground = fillCubeTile(
    key,
    (p, finest) => heightAtSphere(distance, seed, p, finest),
    { finest: cubeDetailCut(eye, distance) },
  );
  const [low, high] = gridRange(ground.heights);
  const land = high < 0 ? null : ground;
  const sea = low > 0 ? null : fillCubeTile(key, () => 0);
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

/** Posts a failure the pool can see: a rejection in a worker reaches no `error` listener. */
const failed = (error: unknown) => {
  reply({
    kind: 'failed',
    message: error instanceof Error ? error.message : String(error),
  });
};

addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  if (request.kind === 'init') {
    const start = performance.now();
    world = openSphereWorld(request.world).then(({ field, seed }) => {
      // A copy, not a transfer: this worker keeps filling from its own.
      reply({
        kind: 'built',
        buildMs: performance.now() - start,
        field: request.sendField ? field : null,
        seed,
      });
      return { field, seed };
    });
    world.catch(failed);
    return;
  }
  if (world === null) throw new Error('tile worker: fill before init');
  world
    .then((built) => {
      const tile = fill(built, request.key, request.eye);
      reply({ kind: 'tile', tile }, filledBuffers(tile));
    })
    .catch(failed);
});

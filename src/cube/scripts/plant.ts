/**
 * Plants the world: `pnpm tsx src/cube/scripts/plant.ts [floors=64]` writes the
 * seed and one commitment per floor but the last to
 * `entities/world/config/world.json`. The landing rooms it draws are printed
 * nowhere and kept nowhere, so no one can skip a floor.
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { format } from 'prettier';
import { z } from 'zod';

import { plant } from '@/cube/entities/world';

const OUT = path.join(
  import.meta.dirname,
  '../entities/world/config/world.json',
);

const floors = z.coerce
  .number()
  .int()
  .min(1)
  .parse(process.argv[2] ?? '64');

const { world } = await plant(floors, (bytes) => {
  crypto.getRandomValues(bytes);
});
await writeFile(
  OUT,
  await format(JSON.stringify(world), { parser: 'json', filepath: OUT }),
);

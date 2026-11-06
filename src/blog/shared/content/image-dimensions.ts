import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import { PUBLIC_DIR } from '@/kernel/shared/config/index.node-safe';
import type { Sized } from '@/kernel/shared/typings';

import { headerDimensions } from './image-headers';

/**
 * Reads the file's own header, so no image library is needed for the formats
 * the content uses. Throws on a `src` that resolves to nothing, so a broken
 * reference fails the build instead of reaching a reader.
 */
export function intrinsicDimensions(src: string): Sized | undefined {
  const filePath = path.join(PUBLIC_DIR, src);

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Content image not found: ${src} (looked in ${filePath}). ` +
        `Check the reference in the markdown, or add the file under public/.`,
    );
  }

  return headerDimensions(
    fs.readFileSync(filePath),
    path.extname(filePath).toLowerCase(),
  );
}

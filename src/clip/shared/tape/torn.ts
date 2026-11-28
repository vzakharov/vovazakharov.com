import type { Seeded } from '@/kernel/shared/typings';

import { type Pen, rng, STAGE } from '../ink';
import { buffer, context2d, deviceScale, fitUnits, wipe } from './buffers';
import { TAPE_PALETTE } from './palette-tape';

/** How badly a picture is torn: `amount` in `[0, 1]`, `seed` choosing the tear. */
type Tear = Seeded & { amount: number };

// The widest a strip is thrown sideways at a full tear, in stage units.
const THROW = 220;

/**
 * Paints what `draw` paints on the stage, torn into horizontal strips the way
 * a chewed tape plays: strips thrown sideways, some replaying a band from
 * elsewhere in the picture, some stretched. One `seed` is one tear, so a
 * caller holding it holds the tear still. Paints the whole stage.
 */
export function torn(pen: Pen, draw: (pen: Pen) => void, tear: Tear): void {
  const { ctx } = pen;
  const { amount, seed } = tear;
  const scale = deviceScale(ctx);
  const picture = buffer(
    ctx,
    'tape:torn',
    STAGE.width * scale,
    STAGE.height * scale,
  );
  const pc = context2d(picture);
  fitUnits(pc, STAGE.width, STAGE.height);
  wipe(pc, TAPE_PALETTE.black, STAGE.width, STAGE.height);
  draw({ ...pen, ctx: pc });

  const px = picture.width / STAGE.width;
  const random = rng(seed);
  ctx.save();
  wipe(ctx, TAPE_PALETTE.black, STAGE.width, STAGE.height);
  let y = 0;
  while (y < STAGE.height) {
    const height = Math.min(
      STAGE.height - y,
      12 + random() * (STAGE.height / (3 + amount * 9)),
    );
    // Most strips slip a little; a few are thrown far.
    const slip = (random() * 2 - 1) ** 3 * THROW * amount;
    const replayed = random() < amount * 0.3;
    const sourceY = replayed ? random() * (STAGE.height - height) : y;
    const stretch = random() < amount * 0.2 ? 0.35 + random() * 0.4 : 1;
    ctx.drawImage(
      picture,
      0,
      sourceY * px,
      picture.width,
      height * stretch * px,
      slip,
      y,
      STAGE.width,
      height + 0.6,
    );
    y += height;
  }
  ctx.restore();
}

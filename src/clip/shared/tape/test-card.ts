import { ellipse, ink, type Pen, polygon } from '../ink';
import { dotText } from './dot-text';
import { SCREEN } from './lines';
import { TAPE_PALETTE } from './palette-tape';

const BARS_DOWN = 470;
const STRIP_DOWN = 540;

/**
 * Channel «ГБ»'s test card, a broadcast scene: colour bars, the mirrored
 * strip under them, a grey ramp, and a ringed cross over it all with the
 * channel's name.
 */
export function testCard(pen: Pen): void {
  const { ctx } = pen;
  const { width, height } = SCREEN;
  const bar = width / TAPE_PALETTE.bars.length;
  for (const [n, color] of TAPE_PALETTE.bars.entries()) {
    ctx.fillStyle = color;
    ctx.fillRect(n * bar, 0, bar + 0.5, BARS_DOWN);
  }
  for (const [n, color] of TAPE_PALETTE.castellations.entries()) {
    ctx.fillStyle = color;
    ctx.fillRect(n * bar, BARS_DOWN, bar + 0.5, STRIP_DOWN - BARS_DOWN);
  }
  const step = width / TAPE_PALETTE.ramp.length;
  for (const [n, color] of TAPE_PALETTE.ramp.entries()) {
    ctx.fillStyle = color;
    ctx.fillRect(n * step, STRIP_DOWN, step + 0.5, height - STRIP_DOWN);
  }

  const [cx, cy] = [width / 2, 300];
  ink(pen, ellipse([cx, cy], 232), {
    stroke: TAPE_PALETTE.white,
    width: 9,
    seed: 1,
  });
  ink(pen, ellipse([cx, cy], 232), { width: 3, seed: 1 });
  ink(
    pen,
    polygon(
      [
        [cx - 300, cy],
        [cx + 300, cy],
      ],
      'open',
    ),
    { stroke: TAPE_PALETTE.white, width: 5, seed: 2 },
  );
  ink(
    pen,
    polygon(
      [
        [cx, cy - 280],
        [cx, cy + 280],
      ],
      'open',
    ),
    { stroke: TAPE_PALETTE.white, width: 5, seed: 3 },
  );
  ink(
    pen,
    polygon([
      [cx - 150, cy - 58],
      [cx + 150, cy - 58],
      [cx + 150, cy + 58],
      [cx - 150, cy + 58],
    ]),
    { fill: TAPE_PALETTE.black, stroke: TAPE_PALETTE.white, width: 5, seed: 4 },
  );
  dotText(pen, 'КАНАЛ', [cx, cy - 42], {
    dot: 5,
    color: TAPE_PALETTE.white,
    align: 'center',
  });
  dotText(pen, 'ГБ', [cx, cy + 4], {
    dot: 6,
    color: TAPE_PALETTE.bugDisc,
    align: 'center',
  });
}

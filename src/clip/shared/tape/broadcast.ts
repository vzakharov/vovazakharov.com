import { type Pen, reseed, STAGE } from '../ink';
import { deviceScale, wipe } from './buffers';
import { frameAt, trackingBar, zapState } from './curves';
import { SCREEN, tapeLines } from './lines';
import { fillNoise } from './noise-tiles';
import { drawOsd, type Osd } from './osd';
import { TAPE_PALETTE } from './palette-tape';
import { record, type Scene, type Taping } from './recording';
import { PICTURE, scanlines, tubeBezel, tubeGlass } from './tube';

// Past this many device pixels a unit — the 1080p export's own — the tape's
// softness hides any further detail, so its buffers stop growing.
const MAX_SCALE = 1.5;

export type Broadcast = Taping & {
  /** The VCR's display; `null` for none. */
  osd?: Osd | null;
};

/**
 * Puts `scene` on the stage as a 4:3 TV picture played off a worn tape:
 * pillarboxed, with tube corners, chroma split, tracking tears, head-switching
 * noise, scanlines, vignette and glare. Paints the whole stage.
 */
export function broadcast(
  pen: Pen,
  scene: Scene,
  options: Broadcast = {},
): void {
  const { ctx, playhead: t } = pen;
  const { wear = 0.3, zap = 1, unbranded = false, osd = {} } = options;
  const frame = frameAt(t);
  const { roll, jitter } = zapState(zap);
  const bar = trackingBar(t, wear);
  const tape = record(pen, scene, {
    scale: Math.min(deviceScale(ctx), MAX_SCALE),
    zap,
    wear,
    unbranded,
  });
  const lines = tapeLines({ frame, wear, bar, slip: roll, jitter });
  const { x, y } = PICTURE;
  const { width, height } = SCREEN;

  ctx.save();
  wipe(ctx, TAPE_PALETTE.black, STAGE.width, STAGE.height);

  // Strip by strip; each strip overlaps the next by a hair so the
  // antialiased edges between them never show as lines.
  const rows = tape.height / height;
  for (const line of lines) {
    ctx.drawImage(
      tape,
      0,
      line.sourceRow * rows,
      tape.width,
      line.height * rows,
      x + line.dx,
      y + line.y,
      width,
      line.height + 0.6,
    );
  }
  if (roll > 0.002) {
    // The blanking interval, showing as a black bar where a rolling picture
    // meets its own top.
    ctx.fillStyle = TAPE_PALETTE.black;
    ctx.fillRect(x, y + height * (1 - roll) - 6, width, 30);
  }

  // Noise where the heads lose the track: the bar and the bottom strip.
  const key = reseed(0x7a_9e, frame);
  ctx.globalCompositeOperation = 'lighter';
  if (bar) {
    ctx.globalAlpha = bar.strength * 0.5;
    fillNoise(
      ctx,
      'snow',
      [x, y + bar.y - bar.height / 2, width, bar.height],
      [5, 1],
      reseed(key, 1),
    );
  }
  ctx.globalAlpha = 0.25 + wear * 0.4;
  fillNoise(
    ctx,
    'snow',
    [x, y + height - 10, width, 10],
    [6, 1],
    reseed(key, 2),
  );
  dropouts(ctx, key, wear);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;

  if (osd) drawOsd(pen, osd, [x, y]);
  scanlines(ctx, wear);
  tubeGlass(ctx);
  tubeBezel(ctx);
  ctx.restore();
}

// White flecks where the tape has shed oxide: a few short streaks a frame,
// more of them the worse the wear.
function dropouts(
  ctx: CanvasRenderingContext2D,
  key: number,
  wear: number,
): void {
  const count = Math.floor(
    wear * wear * 9 + ((reseed(key, 9) % 100) / 100 < wear ? 1 : 0),
  );
  ctx.fillStyle = TAPE_PALETTE.white;
  for (let n = 0; n < count; n += 1) {
    const seed = reseed(key, 100 + n);
    ctx.globalAlpha = 0.35 + (seed % 50) / 100;
    ctx.fillRect(
      PICTURE.x + (seed % SCREEN.width),
      (seed >>> 10) % SCREEN.height,
      12 + ((seed >>> 20) % 70),
      1.2,
    );
  }
}

import { STAGE } from '../ink';
import { buffer, deviceScale } from './buffers';
import { SCREEN } from './lines';
import { TAPE_PALETTE } from './palette-tape';

/** Where the 4:3 picture's top-left corner sits on the 16:9 stage. */
export const PICTURE = { x: (STAGE.width - SCREEN.width) / 2, y: 0 } as const;

const LEFT = PICTURE.x;
const CORNER = 46;

let bezel: Path2D | undefined;

/**
 * Covers everything on the stage outside the tube's face, the 4:3 picture
 * with rounded corners: a mask laid over the picture rather than a clip under
 * it, since every draw under a curved clip pays for the curve.
 */
export function tubeBezel(ctx: CanvasRenderingContext2D): void {
  if (!bezel) {
    const [l, t, r, b] = [LEFT, 0, LEFT + SCREEN.width, SCREEN.height];
    bezel = new Path2D();
    bezel.rect(0, 0, STAGE.width, STAGE.height);
    bezel.moveTo(l + CORNER, t);
    bezel.arcTo(r, t, r, b, CORNER);
    bezel.arcTo(r, b, l, b, CORNER);
    bezel.arcTo(l, b, l, t, CORNER);
    bezel.arcTo(l, t, r, t, CORNER);
    bezel.closePath();
  }
  ctx.save();
  ctx.fillStyle = TAPE_PALETTE.bezel;
  ctx.fill(bezel, 'evenodd');
  ctx.restore();
}

// One line in three of the tube's 240 is dark: the gaps between scanned lines.
const LINE_PITCH = 3;
let lines: Path2D | undefined;

/** Darkens the gaps between the picture's scanned lines. */
export function scanlines(ctx: CanvasRenderingContext2D, wear: number): void {
  if (!lines) {
    lines = new Path2D();
    for (let y = 0; y < SCREEN.height; y += LINE_PITCH) {
      lines.rect(LEFT, y + LINE_PITCH * 0.55, SCREEN.width, LINE_PITCH * 0.45);
    }
  }
  ctx.save();
  ctx.globalAlpha = 0.2 + wear * 0.12;
  ctx.fillStyle = TAPE_PALETTE.black;
  ctx.fill(lines);
  ctx.restore();
}

// The glass, painted once per size: corners darkened, a faint glare top left.
function paintGlass(ctx: CanvasRenderingContext2D): void {
  const { width, height } = SCREEN;
  ctx.setTransform(
    ctx.canvas.width / width,
    0,
    0,
    ctx.canvas.height / height,
    0,
    0,
  );
  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    height * 0.38,
    width / 2,
    height / 2,
    width * 0.72,
  );
  vignette.addColorStop(0, TAPE_PALETTE.transparent);
  vignette.addColorStop(1, TAPE_PALETTE.black);
  ctx.globalAlpha = 0.72;
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
  const radius = width * 0.36;
  ctx.translate(width * 0.3, height * 0.24);
  ctx.rotate(-0.35);
  ctx.scale(1, 0.45);
  const glare = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
  glare.addColorStop(0, TAPE_PALETTE.glare);
  glare.addColorStop(1, TAPE_PALETTE.glareEdge);
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = glare;
  ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
}

/** The glass over the picture, one unscaled copy of a layer cached per size. */
export function tubeGlass(ctx: CanvasRenderingContext2D): void {
  const scale = deviceScale(ctx);
  const glass = buffer(
    ctx,
    'tape:glass',
    SCREEN.width * scale,
    SCREEN.height * scale,
    paintGlass,
  );
  ctx.drawImage(glass, LEFT, 0, SCREEN.width, SCREEN.height);
}

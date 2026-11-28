import { type ClipFilmHook, FILM_HOOK } from '@/clip/shared/film';
import { INK_PALETTE, penAt, STAGE } from '@/clip/shared/ink';
import { SONG_SECONDS, SONG_URL } from '@/clip/shared/score';
import { frame, type Shot } from '@/clip/shared/timeline';

import { fitStage, type PlayerMode, type StageFit } from '../lib/stage-fit';
import { PLACEHOLDER_PALETTE } from './palette-placeholder';

/** The scrub bar's height, and the strip over it a click seeks in, in CSS pixels. */
const SCRUB_HEIGHT = 4;
const SCRUB_REACH = 28;

/**
 * Plays `shots` on `canvas`, which covers the viewport: the stage letterboxed
 * in it at the device's pixel density, drawing code in stage units. Returns
 * what stops it.
 */
export function mountPlayer(
  canvas: HTMLCanvasElement,
  mode: PlayerMode,
  shots: readonly Shot[],
): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2D context for the clip');
  let fit: StageFit = fitStage(1, 1);
  let ratio = 1;

  const paint = (t: number) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = INK_PALETTE.ink;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    const scale = fit.scale * ratio;
    ctx.setTransform(
      scale,
      0,
      0,
      scale,
      fit.corner.x * ratio,
      fit.corner.y * ratio,
    );
    ctx.beginPath();
    ctx.rect(0, 0, STAGE.width, STAGE.height);
    ctx.clip();
    frame(penAt(ctx, t), shots);
    ctx.restore();
  };

  const resize = () => {
    ratio = globalThis.devicePixelRatio || 1;
    canvas.width = Math.round(globalThis.innerWidth * ratio);
    canvas.height = Math.round(globalThis.innerHeight * ratio);
    fit = fitStage(globalThis.innerWidth, globalThis.innerHeight);
  };
  resize();

  if (mode.kind === 'still') {
    const still = () => {
      resize();
      paint(mode.t);
    };
    still();
    globalThis.addEventListener('resize', still);
    return () => {
      globalThis.removeEventListener('resize', still);
    };
  }

  if (mode.kind === 'film') {
    const hook: ClipFilmHook = {
      ready: async () => {
        await document.fonts.ready;
        resize();
        return true;
      },
      draw: (t) => {
        paint(t);
        return true;
      },
    };
    Object.assign(globalThis, { [FILM_HOOK]: hook });
    return () => {
      Reflect.deleteProperty(globalThis, FILM_HOOK);
    };
  }

  return play(canvas, ctx, paint, resize);
}

/** The scrub bar and, while paused, a play mark, drawn over the stage in CSS pixels. */
function chrome(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  share: number,
  paused: boolean,
): void {
  const ratio = globalThis.devicePixelRatio || 1;
  const width = canvas.width / ratio;
  const height = canvas.height / ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.fillStyle = PLACEHOLDER_PALETTE.track;
  ctx.fillRect(0, height - SCRUB_HEIGHT, width, SCRUB_HEIGHT);
  ctx.fillStyle = PLACEHOLDER_PALETTE.played;
  ctx.fillRect(0, height - SCRUB_HEIGHT, width * share, SCRUB_HEIGHT);
  if (!paused) return;
  const size = Math.min(width, height) / 10;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.moveTo(width / 2 - size / 2, height / 2 - size / 2);
  ctx.lineTo(width / 2 + size / 2, height / 2);
  ctx.lineTo(width / 2 - size / 2, height / 2 + size / 2);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** Plays the song and draws the clip at its time on every animation frame. */
function play(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  paint: (t: number) => void,
  resize: () => void,
): () => void {
  const audio = new Audio(SONG_URL);
  audio.preload = 'auto';
  const length = () =>
    Number.isFinite(audio.duration) ? audio.duration : SONG_SECONDS;

  const toggle = () => {
    if (audio.paused) {
      audio.play().catch((error: unknown) => {
        // An abort is a pause landing before the play began.
        if (error instanceof DOMException && error.name === 'AbortError')
          return;
        throw error;
      });
    } else {
      audio.pause();
    }
  };
  const onPointer = (event: PointerEvent) => {
    if (event.clientY >= globalThis.innerHeight - SCRUB_REACH) {
      audio.currentTime = (event.clientX / globalThis.innerWidth) * length();
      return;
    }
    toggle();
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.code !== 'Space') return;
    event.preventDefault();
    toggle();
  };

  let request = 0;
  const tick = () => {
    paint(audio.currentTime);
    chrome(canvas, ctx, audio.currentTime / length(), audio.paused);
    request = requestAnimationFrame(tick);
  };
  request = requestAnimationFrame(tick);
  canvas.addEventListener('pointerdown', onPointer);
  globalThis.addEventListener('keydown', onKey);
  globalThis.addEventListener('resize', resize);
  return () => {
    cancelAnimationFrame(request);
    audio.pause();
    canvas.removeEventListener('pointerdown', onPointer);
    globalThis.removeEventListener('keydown', onKey);
    globalThis.removeEventListener('resize', resize);
  };
}

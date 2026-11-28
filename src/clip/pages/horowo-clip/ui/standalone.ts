import COPY from '../config/messages/en.json';
import { readMode } from '../lib/stage-fit';
import { mountPlayer } from './player';
import { SHOTS } from './shots';

/**
 * The clip on a page of its own, outside Next: a canvas appended to `<body>`,
 * which the page's own stylesheet stretches over the viewport, playing against
 * the song at `audio`.
 */
export function mountStandalone(audio: string): void {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-label', COPY.stage);
  document.body.append(canvas);
  mountPlayer(canvas, readMode(globalThis.location.search), SHOTS, audio);
}

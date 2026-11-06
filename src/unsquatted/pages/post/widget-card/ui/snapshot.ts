import { domToBlob } from 'modern-screenshot';

const TYPE = 'image/png';

/**
 * `figure` as the reader sees it, set on the page's background by `frame`, a
 * class whose rules also hide what an image cannot use. The copy is drawn
 * offscreen, so the page never shows it, and at twice the pixels for a
 * phone's screen.
 */
export async function snapshot(
  figure: HTMLElement,
  frame: string | undefined,
  name: string,
): Promise<File> {
  if (frame === undefined) throw new Error('The snapshot frame has no class');
  const copy = figure.cloneNode(true);
  if (!(copy instanceof HTMLElement))
    throw new TypeError('A figure cloned into something not an element');
  copy.removeAttribute('id');

  const holder = document.createElement('div');
  holder.className = frame;
  holder.style.width = `${figure.offsetWidth}px`;
  holder.append(copy);
  document.body.append(holder);

  try {
    const blob = await domToBlob(holder, {
      scale: 2,
      type: TYPE,
      // The image starts where the holder does, wherever that sits on screen.
      style: { position: 'static' },
    });

    return new File([blob], `unsquatted.${name}.png`, { type: TYPE });
  } finally {
    holder.remove();
  }
}

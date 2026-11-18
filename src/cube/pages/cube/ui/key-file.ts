import { type Identity, loginLink } from '@/cube/features/account';

import type COPY from '../config/messages/en.json';

/** Characters of the id a key file's name carries, telling two keys apart. */
const NAMED_BY = 8;

/** How long a key file's blob URL outlives the click that downloads it. */
const KEEP_URL_MS = 1000;

/** The name `identity`'s key file downloads as. */
export const keyFileName = ({ id }: Identity): string =>
  `cube-key-${id.slice(0, NAMED_BY)}.txt`;

/**
 * Downloads `identity`'s key file: the login link and the twelve words, with
 * `copy`'s note on keeping them. Its text logs in wherever it is opened or
 * pasted, the link being what the login finds in it.
 */
export function downloadKey(
  identity: Identity,
  copy: (typeof COPY)['account'],
): void {
  const { origin, pathname } = globalThis.location;
  const text = copy.keyText
    .replace('{link}', loginLink(`${origin}${pathname}`, identity.phrase))
    .replace('{words}', identity.phrase);
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = keyFileName(identity);
  anchor.click();
  // Revoked at once, Safari can lose a download it has not started reading.
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, KEEP_URL_MS);
}

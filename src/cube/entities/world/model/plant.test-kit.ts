/** A deterministic byte source: a counter, run through a multiplicative mix. */
export function counterRandom(): (bytes: Uint8Array) => void {
  let counter = 0;
  return (bytes) => {
    for (let i = 0; i < bytes.length; i += 1) {
      counter += 1;
      bytes[i] = (Math.imul(counter, 2_654_435_761) >>> 24) & 0xff;
    }
  };
}

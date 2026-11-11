const HEADER = 44;

/**
 * `samples` as a mono 16-bit WAV file's bytes: what an `<audio>` element or a
 * file on disk takes, for hearing a line outside the cube.
 */
export function wavOf(samples: Float32Array, sampleRate: number): Uint8Array {
  const bytes = new Uint8Array(HEADER + samples.length * 2);
  const view = new DataView(bytes.buffer);
  const tag = (at: number, text: string) => {
    for (let n = 0; n < text.length; n += 1) {
      view.setUint8(at + n, text.codePointAt(n) ?? 0);
    }
  };
  tag(0, 'RIFF');
  view.setUint32(4, bytes.length - 8, true);
  tag(8, 'WAVEfmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  tag(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  for (const [n, sample] of samples.entries()) {
    const clipped = Math.max(-1, Math.min(1, sample));
    view.setInt16(HEADER + n * 2, Math.round(clipped * 32_767), true);
  }
  return bytes;
}

const HEADER = 44;

const word = (sample: number): number =>
  Math.round(Math.max(-1, Math.min(1, sample)) * 32_767);

/** `left` and `right` as a stereo 16-bit WAV file's bytes. */
export function stereoWavOf(
  left: Float32Array,
  right: Float32Array,
  sampleRate: number,
): Buffer {
  const bytes = Buffer.alloc(HEADER + left.length * 4);
  bytes.write('RIFF', 0, 'latin1');
  bytes.writeUInt32LE(bytes.length - 8, 4);
  bytes.write('WAVEfmt ', 8, 'latin1');
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(2, 22);
  bytes.writeUInt32LE(sampleRate, 24);
  bytes.writeUInt32LE(sampleRate * 4, 28);
  bytes.writeUInt16LE(4, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write('data', 36, 'latin1');
  bytes.writeUInt32LE(left.length * 4, 40);
  for (const [n, sample] of left.entries()) {
    bytes.writeInt16LE(word(sample), HEADER + n * 4);
    bytes.writeInt16LE(word(right[n] ?? 0), HEADER + n * 4 + 2);
  }
  return bytes;
}

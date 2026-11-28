/** Rendered sound: one array of samples in `[-1, 1]` a channel, all one length. */
export type Rendered = {
  sampleRate: number;
  channels: readonly Float32Array[];
};

const HEADER_BYTES = 44;

/** `sound` as a 16-bit PCM WAV file, its channels interleaved. */
export function wav({ sampleRate, channels }: Rendered): Uint8Array {
  const length = channels[0]?.length ?? 0;
  const blockAlign = channels.length * 2;
  const dataBytes = length * blockAlign;
  const bytes = new Uint8Array(HEADER_BYTES + dataBytes);
  const view = new DataView(bytes.buffer);
  // The chunk tags are ASCII, one byte a character.
  const ascii = (at: number, tag: string) => {
    for (let n = 0; n < tag.length; n += 1) {
      view.setUint8(at + n, tag.codePointAt(n) ?? 0);
    }
  };
  ascii(0, 'RIFF');
  view.setUint32(4, HEADER_BYTES - 8 + dataBytes, true);
  ascii(8, 'WAVE');
  ascii(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels.length, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  ascii(36, 'data');
  view.setUint32(40, dataBytes, true);
  for (let n = 0; n < length; n += 1) {
    for (const [c, samples] of channels.entries()) {
      const sample = Math.max(-1, Math.min(1, samples[n] ?? 0));
      view.setInt16(
        HEADER_BYTES + n * blockAlign + c * 2,
        Math.round(sample * 0x7f_ff),
        true,
      );
    }
  }
  return bytes;
}

/** `bytes` in base64, a chunk at a time so no call takes too many arguments. */
export function base64(bytes: Uint8Array): string {
  const chunk = 0x80_00;
  let text = '';
  for (let at = 0; at < bytes.length; at += chunk) {
    text += String.fromCodePoint(...bytes.subarray(at, at + chunk));
  }
  return btoa(text);
}

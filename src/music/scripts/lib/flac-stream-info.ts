/**
 * A FLAC master's STREAMINFO, fetched as the first 128 KB of the file rather
 * than the whole of it: a ten-song scaffold moves about 1 MB where the masters
 * themselves are a quarter of a gigabyte. That the host answers a range
 * request at all is what lets the player seek.
 */

/** Enough of the file to hold `fLaC` plus the STREAMINFO block, with room for a large one. */
const HEADER_BYTES = 128 * 1024;

/** Sample rate, channel count and total samples, as STREAMINFO packs them. */
export type StreamInfo = {
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
  totalSamples: number;
};

/**
 * The 36-bit sample count and the fields packed beside it. Offsets are
 * STREAMINFO's own: the last eight bytes carry a 20-bit sample rate, a 3-bit
 * channel count, a 5-bit sample depth and the sample total, none of them
 * byte-aligned.
 */
function parseStreamInfo(block: Buffer): StreamInfo {
  const at = (offset: number) => block.readUInt8(offset);

  return {
    sampleRate: (at(10) << 12) | (at(11) << 4) | (at(12) >> 4),
    channels: ((at(12) >> 1) & 0b111) + 1,
    bitsPerSample: (((at(12) & 1) << 4) | (at(13) >> 4)) + 1,
    // Beyond 32 bits, so the top nibble is added rather than shifted in.
    totalSamples:
      (at(13) & 0b1111) * 2 ** 32 +
      ((at(14) << 24) >>> 0) +
      (at(15) << 16) +
      (at(16) << 8) +
      at(17),
  };
}

/** Walks the metadata blocks to STREAMINFO, which the format puts first. */
function readStreamInfo(header: Buffer, url: string): StreamInfo {
  if (header.subarray(0, 4).toString('latin1') !== 'fLaC') {
    throw new Error(`${url} does not begin with a FLAC signature`);
  }

  const length = header.readUIntBE(5, 3);

  if ((header.readUInt8(4) & 0x7f) !== 0 || length < 34) {
    throw new Error(`${url} does not lead with a STREAMINFO block`);
  }

  return parseStreamInfo(header.subarray(8, 8 + length));
}

export async function fetchStreamInfo(url: string): Promise<StreamInfo> {
  const response = await fetch(url, {
    headers: { range: `bytes=0-${HEADER_BYTES - 1}` },
  });

  if (response.status !== 206) {
    throw new Error(
      `${url} answered ${response.status} to a range request; the player needs one to seek`,
    );
  }

  return readStreamInfo(
    Buffer.from(await response.arrayBuffer()),
    new URL(url).pathname,
  );
}

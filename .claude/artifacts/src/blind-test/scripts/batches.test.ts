import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  type AudioFile,
  BATCH_BYTES,
  batchFiles,
  MAX_FILE_BYTES,
} from "./batches.ts";

const file = (name: string, bytes: number): AudioFile => ({
  published: `audio/${name}.mp3`,
  source: `blind/${name}.mp3`,
  bytes,
});

describe("batchFiles", () => {
  it("keeps files together while they fit", () => {
    assert.deepEqual(batchFiles([file("a", 10), file("b", 20)]), [
      { "audio/a.mp3": "blind/a.mp3", "audio/b.mp3": "blind/b.mp3" },
    ]);
  });

  it("opens a new publish where the bytes would overflow", () => {
    const big = MAX_FILE_BYTES;
    const count = Math.floor(BATCH_BYTES / big) + 1;
    const files = Array.from({ length: count }, (_, index) =>
      file(String(index), big),
    );
    const batches = batchFiles(files);
    assert.equal(batches.length, 2);
    assert.equal(Object.keys(batches[1] ?? {}).length, 1);
  });

  it("refuses a file the tool would not take", () => {
    assert.throws(() => batchFiles([file("huge", MAX_FILE_BYTES + 1)]), /over/);
  });
});

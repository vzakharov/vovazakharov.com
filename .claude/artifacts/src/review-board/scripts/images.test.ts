import assert from "node:assert/strict";
import { test } from "node:test";
import {
  dataUri,
  IMAGE_WARN_BYTES,
  imageType,
  oversizeWarnings,
} from "./images.ts";

test("names the media type of PNG, JPEG and WebP by extension, any case", () => {
  assert.equal(imageType("a/b/shot.png"), "image/png");
  assert.equal(imageType("shot.JPG"), "image/jpeg");
  assert.equal(imageType("shot.jpeg"), "image/jpeg");
  assert.equal(imageType("shot.webp"), "image/webp");
});

test("gives no type to other files", () => {
  assert.equal(imageType("pic.bin"), null);
  assert.equal(imageType("logo.svg"), null);
  assert.equal(imageType("png"), null);
  assert.equal(imageType("dir.png/readme"), null);
});

test("encodes bytes as a base64 data URI", () => {
  assert.equal(
    dataUri("image/png", Uint8Array.from([0, 255, 1])),
    "data:image/png;base64,AP8B",
  );
});

test("warns only for images over the threshold", () => {
  const warnings = oversizeWarnings(
    new Map([
      ["small.png", 10],
      ["edge.png", IMAGE_WARN_BYTES],
      ["big.png", IMAGE_WARN_BYTES + 1],
    ]),
  );
  assert.equal(warnings.length, 1);
  assert.match(warnings[0] ?? "", /big\.png/);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  IMAGE_LIMIT_BYTES,
  imagePath,
  imageType,
  oversizeImages,
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

test("publishes an image under its blob id, with its type's extension", () => {
  const id = "0123456789abcdef0123456789abcdef01234567";
  assert.equal(imagePath(id, "image/png"), "images/0123456789abcdef.png");
  assert.equal(imagePath(id, "image/jpeg"), "images/0123456789abcdef.jpeg");
});

test("flags only images over the published file's limit", () => {
  const lines = oversizeImages(
    new Map([
      ["small.png", 10],
      ["edge.png", IMAGE_LIMIT_BYTES],
      ["big.png", IMAGE_LIMIT_BYTES + 1],
    ]),
  );
  assert.equal(lines.length, 1);
  assert.match(lines[0] ?? "", /big\.png/);
});

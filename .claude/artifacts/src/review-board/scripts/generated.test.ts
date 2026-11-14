import assert from "node:assert/strict";
import { test } from "node:test";
import { generatedPaths } from "./generated.ts";

const output = (...rows: [string, string][]): string =>
  rows
    .map(([path, value]) => `${path}\0linguist-generated\0${value}\0`)
    .join("");

test("keeps the paths marked set or true", () => {
  assert.deepEqual(
    generatedPaths(
      output(
        ["a.generated.ts", "true"],
        ["b.og.png", "set"],
        ["c.ts", "unspecified"],
        ["d.ts", "false"],
        ["e.ts", "unset"],
      ),
    ),
    new Set(["a.generated.ts", "b.og.png"]),
  );
});

test("reads no paths from empty output", () => {
  assert.deepEqual(generatedPaths(""), new Set());
});

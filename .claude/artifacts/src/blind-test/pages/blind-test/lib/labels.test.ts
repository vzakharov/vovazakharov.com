import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { clock, variantKeys, variantLabel } from "./labels.ts";

describe("variantLabel", () => {
  it("names the mix by the given word and masters by letter", () => {
    assert.equal(variantLabel("mix", "Микс"), "Микс");
    assert.equal(variantLabel("1", "Микс"), "A");
    assert.equal(variantLabel("4", "Микс"), "D");
  });
});

describe("variantKeys", () => {
  it("binds each variant in both layouts", () => {
    const keys = variantKeys(["mix", "1", "2"]);
    assert.equal(keys.get("m"), "mix");
    assert.equal(keys.get("ь"), "mix");
    assert.equal(keys.get("a"), "1");
    assert.equal(keys.get("ф"), "1");
    assert.equal(keys.get("b"), "2");
    assert.equal(keys.get("и"), "2");
    assert.equal(keys.size, 6);
  });
});

describe("clock", () => {
  it("writes minutes and padded seconds", () => {
    assert.equal(clock(0), "0:00");
    assert.equal(clock(65.9), "1:05");
    assert.equal(clock(600), "10:00");
  });
});

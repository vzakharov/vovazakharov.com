import {
  type BlindSet,
  parseBlindSet,
} from "#src/blind-test/shared/blind-set/index.ts";
import { DATA_ID } from "#src/blind-test/shared/lib/page-ids.ts";
import { el } from "#src/blind-test/shared/ui/index.ts";
import { COPY } from "./copy.ts";

/** The set the build embeds in the page; on failure the error is shown in `root` and rethrown. */
export function loadBlindSet(root: HTMLElement): BlindSet {
  try {
    const node = document.getElementById(DATA_ID);
    if (node === null) throw new Error("the page carries no blind set");
    return parseBlindSet(JSON.parse(node.textContent));
  } catch (error) {
    const box = el("div", "fatal");
    box.append(
      el("h1", "fatal-title", COPY.fatal),
      el("pre", "fatal-detail", String(error)),
    );
    root.replaceChildren(box);
    throw error;
  }
}

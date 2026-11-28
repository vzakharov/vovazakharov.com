import { mountBlindTest } from "#src/blind-test/pages/blind-test/index.ts";
import { ROOT_ID } from "#src/blind-test/shared/lib/page-ids.ts";
import "../styles/blind-test.css";

const root = document.getElementById(ROOT_ID);
if (root === null) throw new Error(`the page has no #${ROOT_ID}`);
mountBlindTest(root);

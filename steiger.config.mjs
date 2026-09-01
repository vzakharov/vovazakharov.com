// Keep this config .mjs, not .ts: cosmiconfig loads a .ts config by transpiling
// it to a transient steiger.config.ts.<uuid>.mjs sidecar in the repo root, which
// the scanners vet.sh runs alongside steiger race against — ENOENT when steiger
// deletes it. A .mjs config loads via plain import, no sidecar.
import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

export default defineConfig([...fsd.configs.recommended]);

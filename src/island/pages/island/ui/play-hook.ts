import { type IslandPlayHook, PLAY_HOOK } from '@/island/shared/play';

import type { IslandScene } from './island-scene';

/**
 * Hands `scene` to a play script on `window[PLAY_HOOK]`; the scene was mounted
 * with its own loop off, so only `step` advances it. Returns the uninstaller.
 */
export function installPlayHook(scene: IslandScene): () => void {
  const times: number[] = [];
  const hook: IslandPlayHook = {
    ready: async () => scene.ready,
    setHeight: async (m) => scene.setHeight(m),
    step: (ms) => {
      const start = performance.now();
      scene.frame(ms / 1000);
      times.push(performance.now() - start);
    },
    frameMs: () => [...times],
  };
  Object.assign(globalThis, { [PLAY_HOOK]: hook });
  return () => {
    Reflect.deleteProperty(globalThis, PLAY_HOOK);
  };
}

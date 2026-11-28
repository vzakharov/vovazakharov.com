import type { Pen } from '@/clip/shared/ink';
import { broadcast, type Scene } from '@/clip/shared/tape';
import type { Local } from '@/clip/shared/timeline';

/** How long a cut takes to lock the new channel, in seconds. */
const ZAP_SECONDS = 0.35;

/** `scene` on the TV as `channel`, tuned in at the shot's cut. */
export function onChannel(
  pen: Pen,
  local: Local,
  scene: Scene,
  channel: number,
): void {
  broadcast(pen, scene, {
    // A one-beat cut locks in its first third rather than staying snow.
    zap: local.sinceCut / Math.min(ZAP_SECONDS, local.seconds / 3),
    osd: { channel, sinceChange: local.sinceCut },
  });
}

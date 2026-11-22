import { dot, max, select, sqrt } from 'three/tsl';
import type { Node } from 'three/webgpu';

import { R } from '@/island/shared/globe';

import { CLOUD_BASE, CLOUD_TOP } from '../lib/clouds';
import type { CloudFrame } from './cloud-nodes';

type F = Node<'float'>;
type V = Node<'vec3'>;

/**
 * The whole stretch of a ray from the eye inside the cloud layer — where it
 * enters and how long it stays — the planet ignored: the same stretch
 * `cloud-nodes.ts` marches, uncut. An editing trap: it restates that file's
 * layer, and goes once the clouds expose theirs (`cloud-rays.ts`'s `stretch`
 * on the clouds branch).
 */
export function cloudSpan({ up, height, radius }: CloudFrame) {
  const meets = (cosine: F, over: number) => {
    const half = radius.mul(cosine);
    const inside = half
      .mul(half)
      .sub(height.sub(over).mul(height.add(2 * R + over)));
    const root = sqrt(max(inside, 0));
    return {
      hit: inside.greaterThan(0),
      near: half.negate().sub(root),
      far: half.negate().add(root),
    };
  };
  return (direction: V): { readonly from: F; readonly length: F } => {
    const cosine = dot(direction, up);
    const base = meets(cosine, CLOUD_BASE);
    const top = meets(cosine, CLOUD_TOP);
    const under = height.lessThan(CLOUD_BASE);
    const above = height.greaterThan(CLOUD_TOP);
    const falling = cosine.lessThan(0);
    const enter = select(under, base.far, select(above, top.near, 0));
    const leave = select(
      under,
      top.far,
      select(base.hit.and(falling), base.near, top.far),
    );
    const missed = above.and(top.hit.and(falling).not());
    const from = max(enter, 0);
    return { from, length: select(missed, 0, max(leave.sub(from), 0)) };
  };
}

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { KICKS } from '@/clip/shared/score';

import { type Jerk, jerk } from './camera';

const CUT = 20.5;
const reach = ({ dx, dy }: Jerk): number => Math.hypot(dx, dy);

describe('jerk', () => {
  it('lands well off its mark on the cut and settles within half a second', () => {
    const quiet = { kick: 0, shake: 0 };
    assert.ok(reach(jerk(CUT, CUT, quiet)) > 100);
    assert.ok(reach(jerk(CUT + 0.6, CUT, quiet)) < 10);
  });

  it('is knocked on a kick and has recovered before the next', () => {
    const kick = KICKS.find((hit) => hit > 22 && hit < 24) ?? 0;
    const still = { whip: 0, shake: 0 };
    assert.ok(jerk(kick, 0, still).zoom > 1.2);
    assert.ok(jerk(kick + 0.2, 0, still).zoom < jerk(kick, 0, still).zoom);
  });

  it('holds still with every motion turned off', () => {
    const { dx, dy, rot, zoom } = jerk(CUT + 0.1, CUT, {
      whip: 0,
      kick: 0,
      shake: 0,
    });
    assert.equal(Math.abs(dx) + Math.abs(dy) + Math.abs(rot), 0);
    assert.equal(zoom, 1);
  });
});

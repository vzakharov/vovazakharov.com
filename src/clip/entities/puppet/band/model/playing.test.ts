import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { distance } from '@/clip/shared/ink';

import { KIT, STICK } from './band';
import { drumming, singing, strumming, thump } from './playing';

describe('thump', () => {
  it('peaks just after the beat and has died away by the next', () => {
    assert.equal(thump(0), 0);
    assert.equal(thump(0.06), 1);
    assert.ok(thump(0.5) < thump(0.2));
    assert.ok(thump(0.99) < 0.05);
  });
});

describe('strumming', () => {
  it('is the same frame for the same beat', () => {
    assert.deepEqual(strumming('guitar', 3.37), strumming('guitar', 3.37));
  });

  it('keeps both feet where they stand through the bar', () => {
    const { footL, footR } = strumming('bass', 0).rig;
    for (const beats of [0.25, 0.5, 1.1, 2.75, 3.9]) {
      const { rig: pose } = strumming('bass', beats);
      assert.ok(distance(pose.footL, footL) < 1e-6);
      assert.ok(distance(pose.footR, footR) < 1e-6);
    }
  });

  it('frets on the neck side of the hand that picks', () => {
    for (const strings of ['guitar', 'bass'] as const) {
      for (const beats of [0, 0.3, 1.6, 5.2]) {
        const { rig: pose } = strumming(strings, beats);
        assert.ok(pose.wristR[0] > pose.wristL[0] + 40);
      }
    }
  });

  it('rings hardest on the beat', () => {
    assert.ok(
      strumming('guitar', 2.06).ringing > strumming('guitar', 2.6).ringing,
    );
  });
});

describe('singing', () => {
  it('stands the mic in front of the singer, its foot on the floor', () => {
    const { rig: pose, stand } = singing(1.4);
    assert.ok(stand.mic[1] < pose.shoulderL[1] + 40);
    assert.ok(stand.foot[1] > pose.footL[1]);
    assert.ok(stand.foot[0] < pose.neck[0]);
  });

  it('pumps the free fist highest on the beat', () => {
    assert.ok(singing(2.06).rig.wristR[1] < singing(2.7).rig.wristR[1]);
  });
});

describe('drumming', () => {
  it('has the left stick on the hi-hat every half beat', () => {
    for (const beats of [0, 0.5, 3, 6.5]) {
      assert.ok(distance(drumming(beats).sticks.L, KIT.hat) < 1e-6);
    }
  });

  it('has the right stick on the snare off the beat and the crash to open eight', () => {
    assert.ok(distance(drumming(1).sticks.R, KIT.snare) < 1e-6);
    assert.ok(distance(drumming(3).sticks.R, KIT.snare) < 1e-6);
    assert.ok(distance(drumming(8).sticks.R, KIT.crash) < 1e-6);
  });

  it('holds each stick a stick away from its tip, or as near as the arm gets', () => {
    for (const beats of [0, 0.4, 1, 1.7, 4.2]) {
      const { rig: pose, sticks } = drumming(beats);
      assert.ok(distance(pose.wristL, sticks.L) < STICK * 1.6);
      assert.ok(distance(pose.wristR, sticks.R) < STICK * 1.6);
    }
  });

  it('hits the kick on the even beats and the snare on the odd', () => {
    assert.ok(drumming(2.06).hits.kick > 0.99);
    assert.ok(drumming(3.06).hits.snare > 0.99);
    assert.ok(drumming(3.06).hits.kick < drumming(2.06).hits.kick);
  });
});

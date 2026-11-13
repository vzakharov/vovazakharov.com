import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ROOM_CUES } from '@/cube/shared/lib/acoustics';

import {
  assertAllDiffer,
  assertAudible,
  TEST_RATE,
} from '../../dsp/index.test-only';
import {
  bearingOf,
  samplesOf,
  SHRINK_SECONDS,
  type SoundCue,
  voicedOf,
} from './cue';
import { footstep } from './footstep';

const HERE = { rightward: 0, roomsAway: 0 };

const CUES: readonly SoundCue[] = [
  { kind: 'step', strength: 0.6, footing: 'wood' },
  { kind: 'jump' },
  { kind: 'landing', speed: 0.9 },
  { kind: 'lever' },
  { kind: 'pill' },
  { kind: 'swallow' },
  { kind: 'rung', limb: 'hand', ladder: 'aluminium' },
  { kind: 'rung', limb: 'foot', ladder: 'wood' },
  { kind: 'splash', strength: 0.7 },
  { kind: 'step', strength: 0.6, footing: 'sand' },
  { kind: 'step', strength: 0.6, footing: 'wet-sand' },
  { kind: 'step', strength: 0.6, footing: 'shallows' },
  { kind: 'breath', effort: 0.5 },
  { kind: 'grunt' },
  { kind: 'shrink' },
  ...ROOM_CUES.map((kind) => ({ kind, from: HERE, loud: 1, seed: 5 })),
];

const near = (actual: number, expected: number) => {
  assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} ≠ ${expected}`);
};

describe('samplesOf', () => {
  it('renders every cue finite and inside ±1, the same from the same seed', () => {
    for (const cue of CUES) {
      const samples = samplesOf(cue, 'tile', 3, TEST_RATE);
      assertAudible(samples);
      assert.deepEqual(samples, samplesOf(cue, 'tile', 3, TEST_RATE), cue.kind);
      assert.notDeepEqual(
        samples,
        samplesOf(cue, 'tile', 4, TEST_RATE),
        cue.kind,
      );
    }
  });

  it('gives no two cues the same sound', () => {
    assertAllDiffer(CUES.map((cue) => samplesOf(cue, 'tile', 3, TEST_RATE)));
  });

  it('steps on the footing the step names, lands on the floor’s', () => {
    assert.deepEqual(
      samplesOf(
        { kind: 'step', strength: 0.6, footing: 'wood' },
        'tile',
        3,
        TEST_RATE,
      ),
      footstep('wood', 0.6, 3, TEST_RATE),
    );
    const landed = { kind: 'landing', speed: 1 } as const;
    assert.notDeepEqual(
      samplesOf(landed, 'tile', 3, TEST_RATE),
      samplesOf(landed, 'carpet', 3, TEST_RATE),
    );
  });

  it('lands the doorway’s 3.6 m drop on sand as the hardest landing, lighter and higher at half height', () => {
    // 3.6 m takes v = √(2·9.81·3.6) ≈ 8.4 m/s, 1.7 room sides a second.
    const fell = { kind: 'landing', speed: 1.7 } as const;
    assert.deepEqual(
      samplesOf(fell, 'sand', 3, TEST_RATE),
      samplesOf({ kind: 'landing', speed: 1 }, 'sand', 3, TEST_RATE),
    );
    const whole = voicedOf(fell, 1);
    const half = voicedOf(fell, 0.5);
    assert.ok(half.loudness < whole.loudness);
    assert.ok(half.playbackRate > whole.playbackRate);
  });

  it('shrinks for the seconds it says', () => {
    assert.equal(
      samplesOf({ kind: 'shrink' }, 'tile', 3, TEST_RATE).length,
      SHRINK_SECONDS * TEST_RATE,
    );
  });
});

describe('bearingOf', () => {
  const ear = { u: 0.5, v: 0.5 };

  it('puts the south on the right of an eye looking east', () => {
    near(bearingOf(ear, 0, { u: 0.5, v: 0.9 }).rightward, 1);
    near(bearingOf(ear, 0, { u: 0.5, v: 0.1 }).rightward, -1);
    near(bearingOf(ear, 0, { u: 0.9, v: 0.5 }).rightward, 0);
    near(bearingOf(ear, 0, { u: 0.1, v: 0.5 }).rightward, 0);
  });

  it('turns with the gaze', () => {
    near(bearingOf(ear, Math.PI / 2, { u: 0.1, v: 0.5 }).rightward, 1);
    near(bearingOf(ear, Math.PI, { u: 0.5, v: 0.9 }).rightward, -1);
  });

  it('measures the way in room sides, past the room’s own edge too', () => {
    near(bearingOf(ear, 1, { u: 0.8, v: 0.9 }).roomsAway, 0.5);
    near(bearingOf(ear, 1, { u: 2.5, v: 0.5 }).roomsAway, 2);
    assert.deepEqual(bearingOf(ear, 1, ear), HERE);
  });
});

const at = (rightward: number, roomsAway: number, loud = 1) =>
  voicedOf({ kind: 'ring', from: { rightward, roomsAway }, loud, seed: 5 }, 1);

describe('voicedOf', () => {
  it('keeps every cue’s mix in range at any scale', () => {
    for (const cue of CUES) {
      for (const scale of [1, 0.7, 0.5, 0, 9]) {
        const { loudness, balance, reverb, playbackRate } = voicedOf(
          cue,
          scale,
        );
        assert.ok(loudness > 0 && loudness <= 1, cue.kind);
        assert.ok(Math.abs(balance) <= 1, cue.kind);
        assert.ok(reverb >= 0 && reverb <= 1, cue.kind);
        assert.ok(playbackRate >= 1 && playbackRate < 2, cue.kind);
      }
    }
  });

  it('makes a shrunk body’s own sounds lighter and higher, not the room’s', () => {
    const step = { kind: 'step', strength: 1, footing: 'tile' } as const;
    assert.ok(voicedOf(step, 0.5).loudness < voicedOf(step, 1).loudness);
    assert.ok(
      voicedOf(step, 0.5).playbackRate > voicedOf(step, 1).playbackRate,
    );
    assert.equal(voicedOf(step, 1).playbackRate, 1);
    for (const cue of [
      { kind: 'lever' },
      { kind: 'shrink' },
      { kind: 'knock', from: HERE, loud: 1, seed: 5 },
    ] as const) {
      assert.deepEqual(voicedOf(cue, 0.5), voicedOf(cue, 1));
    }
  });

  it('fades a room’s sound with distance, aside and into the room', () => {
    assert.ok(at(1, 0.2).loudness > at(1, 1).loudness);
    assert.ok(at(1, 1).loudness > at(1, 3).loudness);
    assert.ok(at(1, 1, 0.3).loudness < at(1, 1).loudness);
    assert.equal(at(1, 2).balance, 1);
    assert.equal(at(-1, 2).balance, -1);
    assert.equal(at(1, 0).balance, 0);
    assert.ok(at(0, 2).reverb > at(0, 0.2).reverb);
  });
});

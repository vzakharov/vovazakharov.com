import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  assertAudible,
  brightness,
  loudness,
  TEST_RATE,
} from '../../dsp/index.test-only';
import { type Beds, bedsOf, rendered } from './beds';
import { hum, under } from './hum';
import { folded, heardAt, type Loop, turning, whole } from './loop';
import { OPEN_AIR, type OutsideMix, perLayer, SOUND_LAYERS } from './mix';
import { fizz, hiss, roar, wash } from './surf';
import { gustAt, SECONDS_AN_HOUR } from './weather';
import { buffet, wind } from './wind';

/** The greatest step between two neighbouring samples of `loop`. */
function steepest({ samples }: Loop): number {
  let most = 0;
  for (let i = 1; i < samples.length; i += 1) {
    most = Math.max(most, Math.abs((samples[i] ?? 0) - (samples[i - 1] ?? 0)));
  }
  return most;
}

const seamOf = ({ samples }: Loop): number =>
  Math.abs((samples[0] ?? 0) - (samples.at(-1) ?? 0));

/** A loop of `turns` whole sines, a hundredth of a second long. */
const beat = (turns: number): Loop =>
  turning(0.01, 8000, (i, length) =>
    Math.sin((turns * 2 * Math.PI * i) / length),
  );

const ramp = (): Loop => beat(7);

/** Every layer at `level` in the left ear and half that in the right. */
const mixOf = (level: number, muffle = OPEN_AIR): OutsideMix => ({
  layers: perLayer(() => ({ leftEar: level, rightEar: level / 2 })),
  muffle,
  humMuffle: OPEN_AIR,
});

describe('a loop', () => {
  it('is the same rendered in pieces as whole', () => {
    const pieces = ramp();
    assert.equal(pieces.render(30), false);
    assert.equal(pieces.render(30), false);
    assert.equal(pieces.render(30), true);
    assert.deepEqual(pieces.samples, whole(ramp()).samples);
    let n = 0;
    const noise = () =>
      folded(0.02, 0.005, 8000, () => Math.sin((n += 1) ** 2));
    const slowly = noise();
    while (!slowly.render(17));
    n = 0;
    assert.deepEqual(slowly.samples, whole(noise()).samples);
  });

  it('is heard the same a turn later, and an hour later', () => {
    const loop = whole(ramp());
    for (const at of [0, 0.0031, 0.0099]) {
      assert.ok(Math.abs(heardAt(loop, at) - heardAt(loop, at + 0.01)) < 1e-9);
      assert.ok(
        Math.abs(heardAt(loop, at) - heardAt(loop, at + SECONDS_AN_HOUR)) <
          1e-6,
      );
    }
  });
});

describe('the outside’s loops', () => {
  const noises = { roar, hiss, fizz, wash, wind, buffet };
  const made = Object.fromEntries(
    Object.entries(noises).map(([name, make]) => [
      name,
      whole(make(7, TEST_RATE)),
    ]),
  );
  const tones = { hum: whole(hum(8000)), under: whole(under(8000)) };

  it('are finite, inside ±1, and all about as loud as each other', () => {
    for (const [name, loop] of Object.entries({ ...made, ...tones })) {
      assertAudible(loop.samples);
      const level = loudness(loop.samples);
      assert.ok(level > 0.15 && level < 0.3, `${name}: ${level}`);
    }
  });

  it('turn a whole number of times an hour', () => {
    for (const [name, loop] of Object.entries({ ...made, ...tones })) {
      assert.ok(Number.isInteger(SECONDS_AN_HOUR / loop.seconds), name);
    }
  });

  it('close with no seam: the step across the end is no step at all', () => {
    for (const [name, loop] of Object.entries({ ...made, ...tones })) {
      assert.ok(seamOf(loop) <= steepest(loop), name);
    }
  });

  it('are the same from the same seed and another sound from another', () => {
    for (const [name, make] of Object.entries(noises)) {
      const again = whole(make(7, TEST_RATE)).samples;
      assert.deepEqual(again, made[name]?.samples, name);
      assert.notDeepEqual(whole(make(8, TEST_RATE)).samples, again, name);
    }
  });

  const bright = (name: string) =>
    brightness(made[name]?.samples ?? new Float32Array(1), 1500);

  it('put the roar low, the hiss and the fizz high, the wash between', () => {
    assert.ok(bright('roar') < 0.2);
    assert.ok(bright('hiss') > 0.6);
    assert.ok(bright('fizz') > 0.6);
    assert.ok(
      bright('wash') > bright('roar') && bright('wash') < bright('hiss'),
    );
    assert.ok(bright('buffet') < 0.05);
  });
});

describe('gustAt', () => {
  const hour = Array.from({ length: 3600 }, (_, seconds) => gustAt(seconds));

  it('stays between calm and the hardest gust, and reaches both', () => {
    assert.ok(hour.every((gust) => gust >= 0 && gust <= 1));
    assert.ok(Math.max(...hour) > 0.9);
    assert.equal(Math.min(...hour), 0);
  });

  it('is calm most of the time', () => {
    const calm = hour.filter((gust) => gust < 0.25).length;
    assert.ok(calm > 0.5 * hour.length, String(calm));
  });

  it('comes round with the hour and moves slowly', () => {
    assert.ok(Math.abs(gustAt(77.7) - gustAt(77.7 + SECONDS_AN_HOUR)) < 1e-9);
    for (let seconds = 1; seconds < hour.length; seconds += 1) {
      const step = Math.abs((hour[seconds] ?? 0) - (hour[seconds - 1] ?? 0));
      assert.ok(step < 0.35, String(seconds));
    }
  });
});

describe('rendered', () => {
  const beds: Beds = perLayer((layer) => {
    const n = SOUND_LAYERS.indexOf(layer);
    return [whole(beat(n + 1)), whole(beat(n + 9))] as const;
  });

  it('is the layers at their levels, each ear its own', () => {
    const [left, right] = rendered(beds, () => mixOf(0.1), 0, 0.02, 8000);
    assert.equal(left.length, 160);
    assert.ok(loudness(left) > 1.2 * loudness(right));
    const [twice] = rendered(beds, () => mixOf(0.2), 0, 0.02, 8000);
    assert.ok(Math.abs(loudness(twice) / loudness(left) - 2) < 1e-6);
  });

  it('is the same an hour on', () => {
    const [now] = rendered(beds, () => mixOf(0.1), 12.3, 0.02, 8000);
    const [hourOn] = rendered(beds, () => mixOf(0.1), 3612.3, 0.02, 8000);
    for (const [i, sample] of now.entries()) {
      assert.ok(Math.abs(sample - (hourOn[i] ?? 0)) < 1e-5);
    }
  });

  it('dulls the sea and the wind behind a wall, and not the hum', () => {
    const [open] = rendered(beds, () => mixOf(0.1), 0, 0.05, 8000);
    const [walled] = rendered(beds, () => mixOf(0.1, 200), 0, 0.05, 8000);
    assert.ok(loudness(walled) < 0.8 * loudness(open));
    assert.ok(loudness(walled) > 0.1 * loudness(open));
  });

  it('names a loop for every layer and ear', () => {
    const real = bedsOf((name) => name.length);
    for (const layer of SOUND_LAYERS) assert.equal(real[layer].length, 2);
    assert.equal(real.hum[0], real.hum[1]);
    assert.notEqual(real.roar[0], real.roar[1]);
  });
});

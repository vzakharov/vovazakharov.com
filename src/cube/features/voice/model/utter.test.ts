import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Line } from './line';
import { lineFor, spoken } from './line-for';
import type { Phone } from './phone';
import { MOMENTS } from './script';
import { chime, piped } from './speaker';
import { powerIn } from './spectrum.test-kit';
import { FRAME_SECONDS, trackOf } from './track';
import { utter } from './utter';
import {
  HUMAN_TO,
  SOURCES,
  SPEAKERS,
  THROATS,
  type Voice,
  voiceOf,
} from './voice';
import { wavOf } from './wav';

const RATE = 16_000;
/**
 * A clear throat of the usual size at the usual pace, pitched so that every
 * harmonic falls where `powerIn` reads.
 */
const ME: Voice = {
  ...voiceOf('somewhere', 1),
  hertz: 100,
  tract: 1,
  tempo: 1,
  airy: 0.1,
};

const held = (phone: Phone): Line => ({
  text: phone,
  tune: 'flat',
  phones: [{ phone, beats: 1 }],
});

const peakOf = (samples: Float32Array): number => {
  let peak = 0;
  for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
  return peak;
};

/** How far the pitch has moved from a line's start to its end. */
const moved = (text: string): number => {
  const { curves, ticks: frames } = trackOf(spoken(text), ME);
  return (curves.semitones[frames - 1] ?? 0) - (curves.semitones[0] ?? 0);
};

const middle = (phone: Phone) => {
  const { curves, ticks: frames } = trackOf(held(phone), ME);
  const at = Math.floor(frames / 2);
  return [curves.voicing[at] ?? 0, curves.hiss[at] ?? 0];
};

const high = (s: Float32Array) => powerIn(s, RATE, 2000, 2600);
const mid = (s: Float32Array) => powerIn(s, RATE, 600, 1300);

const sound = (samples: Float32Array): boolean =>
  samples.every((sample) => Number.isFinite(sample) && Math.abs(sample) <= 1);

describe('utter', () => {
  it('is finite, within ±1 and as long as its track at any rate', () => {
    const line = spoken('here we go again');
    const seconds = trackOf(line, ME).ticks * FRAME_SECONDS;
    for (const rate of [8000, RATE, 44_100, 48_000]) {
      const samples = utter(line, ME, rate);
      assert.ok(sound(samples), `at ${rate}`);
      assert.equal(samples.length, Math.round(seconds * rate));
    }
  });

  it('fills its range: the loudest sample is near 0.9', () => {
    const peak = peakOf(utter(spoken('who built this?'), ME, RATE));
    assert.ok(peak > 0.89 && peak <= 0.9001);
  });

  it('says every moment on every tenth floor in every voice', () => {
    for (const n of [1, 11, 21, 31, 41, 51, 61, 67]) {
      for (const who of SPEAKERS) {
        for (const moment of MOMENTS) {
          const samples = utter(lineFor(moment, n, 4), voiceOf(who, n), 8000);
          assert.ok(sound(samples), `${moment} by ${who} on ${n}`);
          assert.ok(samples.some((sample) => Math.abs(sample) > 0.5));
        }
      }
    }
  });

  it('is the same for the same line, voice and rate', () => {
    const line = spoken('who built this?');
    assert.deepEqual(utter(line, ME, RATE), utter(line, ME, RATE));
  });

  it('differs wholeBetween lines, voices and sources', () => {
    const line = spoken('who built this?');
    const base = utter(line, ME, RATE);
    assert.notDeepEqual(base, utter(spoken('who left this?'), ME, RATE));
    assert.notDeepEqual(base, utter(line, voiceOf('somewhere', 2), RATE));
    for (const source of SOURCES) {
      const voice: Voice = { ...ME, source };
      const samples = utter(line, voice, RATE);
      assert.ok(sound(samples), source);
      if (source !== 'throat') assert.notDeepEqual(base, samples, source);
    }
  });

  it('says nothing, and no NaN, for a line of silence', () => {
    const quiet = utter(held('pau'), ME, RATE);
    assert.ok(quiet.every((sample) => sample === 0));
    assert.equal(
      utter({ text: '', tune: 'fall', phones: [] }, ME, RATE).length > 0,
      true,
    );
  });

  it('puts each vowel where a throat puts it', () => {
    const steady: Voice = { ...ME, unsteady: 0 };
    const ee = utter(held('iy'), steady, RATE);
    const ah = utter(held('aa'), steady, RATE);
    assert.ok(high(ee) > 5 * high(ah));
    assert.ok(mid(ah) > 20 * mid(ee));
    assert.ok(mid(ah) > 20 * high(ah));
  });

  it('hisses an s above a sh, and both above the voice', () => {
    const s = utter(held('s'), ME, RATE);
    const sh = utter(held('sh'), ME, RATE);
    assert.ok(powerIn(s, RATE, 5500, 6500) > powerIn(s, RATE, 2200, 3200));
    assert.ok(powerIn(sh, RATE, 2200, 3200) > powerIn(sh, RATE, 5500, 6500));
    assert.ok(powerIn(s, RATE, 5500, 6500) > 50 * powerIn(s, RATE, 100, 600));
  });

  it('speaks at the pitch of its voice', () => {
    const low = utter(held('aa'), { ...ME, hertz: 100, unsteady: 0 }, RATE);
    const at = (hertz: number) => powerIn(low, RATE, hertz - 5, hertz + 5);
    assert.ok(at(100) > 10 * at(150));
    assert.ok(at(200) > 10 * at(150));
  });

  it('slows with the pace of its voice', () => {
    const line = spoken('here we go again');
    const slow = utter(line, { ...ME, tempo: 0.5 }, RATE);
    assert.ok(slow.length > 1.8 * utter(line, ME, RATE).length);
  });
});

describe('voiceOf', () => {
  it('is the same voice for the same floor', () => {
    for (const who of SPEAKERS) {
      assert.deepEqual(voiceOf(who, 30), voiceOf(who, 30));
      assert.deepEqual(voiceOf(who, 60), voiceOf(who, 60));
    }
  });

  it('keeps the visitor one throat, wearier floor by floor', () => {
    const top = voiceOf('visitor', 1);
    const deep = voiceOf('visitor', 40);
    assert.equal(deep.source, 'throat');
    assert.equal(deep.tract, top.tract);
    assert.ok(deep.tempo < top.tempo);
    assert.ok(deep.hertz < top.hertz);
    assert.ok(deep.airy > top.airy);
  });

  it('puts a different someone elsewhere on every floor', () => {
    const pitches = new Set(
      Array.from(
        { length: HUMAN_TO },
        (_, n) => voiceOf('somewhere', n + 1).hertz,
      ),
    );
    assert.equal(pitches.size, HUMAN_TO);
    assert.notDeepEqual(voiceOf('somewhere', 5), voiceOf('visitor', 5));
    assert.notDeepEqual(
      voiceOf('somewhere', 5).hertz,
      voiceOf('building', 5).hertz,
    );
  });

  it('makes most of them children and women, each many times over', () => {
    const counts = { child: 0, woman: 0, man: 0 };
    for (let n = 1; n <= HUMAN_TO; n += 1) {
      const { hertz, tract } = voiceOf('somewhere', n);
      const kind = hertz >= 265 ? 'child' : hertz >= 185 ? 'woman' : 'man';
      const [low, top] = THROATS[kind].hertz;
      const [small, large] = THROATS[kind].tract;
      assert.ok(hertz >= low && hertz <= top, `floor ${n}`);
      assert.ok(tract >= small && tract <= large, `floor ${n}`);
      counts[kind] += 1;
    }
    assert.ok(counts.child >= 10);
    assert.ok(counts.woman >= 10);
    assert.ok(counts.man >= 5);
  });

  it('is no living throat past floor 49', () => {
    for (let n = 1; n <= 67; n += 1) {
      for (const who of SPEAKERS) {
        const { source, unsteady, hertz, tempo } = voiceOf(who, n);
        assert.equal(n > HUMAN_TO, unsteady === 0, `${who} on ${n}`);
        if (n > HUMAN_TO) assert.notEqual(source, 'throat');
        assert.ok(hertz > 40 && hertz < 450 && tempo > 0.5);
      }
    }
    const sources = new Set(
      Array.from({ length: 18 }, (_, n) => voiceOf('visitor', n + 50).source),
    );
    assert.ok(sources.size >= 2);
  });
});

describe('the building', () => {
  const PA = voiceOf('building', 3);
  const line = lineFor('announcement', 3, 7);

  it('is the only voice out of a loudspeaker', () => {
    for (const who of SPEAKERS) {
      assert.equal(voiceOf(who, 3).piped, who === 'building');
      assert.equal(voiceOf(who, 60).piped, who === 'building');
    }
  });

  it('rings its chime first: two notes, the second lower', () => {
    const rung = chime(150, RATE);
    const first = rung.slice(0, RATE * 0.4);
    const second = rung.slice(RATE * 0.45, RATE * 0.8);
    assert.ok(
      powerIn(first, RATE, 640, 680) > 20 * powerIn(first, RATE, 505, 545),
    );
    assert.ok(
      powerIn(second, RATE, 505, 545) > powerIn(second, RATE, 640, 680),
    );
    const said = utter(line, PA, RATE);
    const bare = utter({ ...line, chime: false }, PA, RATE);
    assert.equal(said.length - bare.length, rung.length);
    assert.ok(chime(100, RATE).length === rung.length);
  });

  it('lets through the middle of the band and rings on after', () => {
    const flat = utter(held('s'), ME, RATE);
    const through = piped(flat, RATE);
    assert.ok(through.length > flat.length + 0.4 * RATE);
    assert.ok(
      powerIn(through, RATE, 5500, 6500) / powerIn(through, RATE, 1500, 2500) <
        0.5 *
          (powerIn(flat, RATE, 5500, 6500) / powerIn(flat, RATE, 1500, 2500)),
    );
    const samples = utter(line, PA, RATE);
    assert.ok(sound(samples));
    assert.ok(peakOf(samples) > 0.89);
    assert.ok(piped(new Float32Array(100), RATE).every((s) => s === 0));
  });
});

describe('trackOf', () => {
  it('raises the pitch at the end of a question and drops it otherwise', () => {
    assert.ok(moved('hello?') > 3);
    assert.ok(moved('hello') < -2);
  });

  it('holds a monotone flat and a sung note where it is written', () => {
    const { curves } = trackOf(lineFor('numbers', 1, 2), ME);
    assert.ok(curves.semitones.every((semitones) => semitones === 0));
    const sung = trackOf(
      {
        text: 'la',
        tune: 'flat',
        phones: [{ phone: 'aa', note: 7, beats: 2 }],
      },
      ME,
    );
    assert.ok(sung.curves.semitones.every((semitones) => semitones === 7));
    assert.ok(sung.ticks * FRAME_SECONDS > 0.9);
  });

  it('slides a note to where it ends, and swells a sound as loud as written', () => {
    const { curves, ticks: frames } = trackOf(
      {
        text: 'huh?',
        tune: 'flat',
        phones: [{ phone: 'ah', note: -1, slide: 8, beats: 1, loud: 0.5 }],
      },
      ME,
    );
    assert.equal(curves.semitones[0], -1);
    assert.ok((curves.semitones[frames - 1] ?? 0) > 7);
    assert.equal(curves.voicing[Math.floor(frames / 2)], 0.5);
  });

  it('voices a vowel, hisses an s and does neither in a pause', () => {
    assert.deepEqual(middle('aa'), [1, 0]);
    assert.deepEqual(middle('s'), [0, 1]);
    assert.deepEqual(middle('pau'), [0, 0]);
  });

  it('scales every resonance by the throat', () => {
    const big = trackOf(held('aa'), { ...ME, tract: 0.5 });
    const usual = trackOf(held('aa'), ME);
    const at = Math.floor(usual.ticks / 2);
    assert.equal(big.curves.f2[at], (usual.curves.f2[at] ?? 0) / 2);
  });
});

describe('wavOf', () => {
  it('wraps samples as a mono 16-bit file', () => {
    const bytes = wavOf(Float32Array.of(0, 1, -1, 2), 8000);
    const view = new DataView(bytes.buffer);
    assert.equal(new TextDecoder().decode(bytes.slice(0, 4)), 'RIFF');
    assert.equal(new TextDecoder().decode(bytes.slice(8, 16)), 'WAVEfmt ');
    assert.equal(bytes.length, 44 + 8);
    assert.equal(view.getUint32(4, true), bytes.length - 8);
    assert.equal(view.getUint32(24, true), 8000);
    assert.equal(view.getUint32(40, true), 8);
    assert.deepEqual(
      [0, 1, 2, 3].map((n) => view.getInt16(44 + n * 2, true)),
      [0, 32_767, -32_767, 32_767],
    );
  });
});

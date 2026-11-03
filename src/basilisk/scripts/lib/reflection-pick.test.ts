import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { seededRandom } from '@/shell/shared/lib/seeded-random';

import { pickReflections, reflectionSlug } from './reflection-pick.ts';

const KINDS = new Map([
  ['hitchbot', false],
  ['waymo', false],
  ['pepper', false],
  ['figure', false],
  ['torture-chamber', true],
  ['openwhip', true],
]);

const FILES = [...KINDS.keys()].map(
  (slug) => `sites/basilisk/public/cases/${slug}.clerk.reflections.md`,
);

describe('pickReflections', () => {
  it('always includes a reflection on a case whose target is an LLM', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const picked = pickReflections(FILES, KINDS, 2, seededRandom(seed));
      assert.equal(picked.length, 2);
      assert.equal(new Set(picked).size, 2);
      assert.ok(
        picked.some((file) => KINDS.get(reflectionSlug(file)) === true),
        `seed ${seed} picked none: ${picked.join(', ')}`,
      );
    }
  });

  it('reaches every reflection across runs', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 200; seed++) {
      for (const file of pickReflections(FILES, KINDS, 2, seededRandom(seed))) {
        seen.add(file);
      }
    }
    assert.equal(seen.size, FILES.length);
  });

  it('picks at random among the rest where no case targets an LLM', () => {
    const plain = FILES.filter(
      (file) => KINDS.get(reflectionSlug(file)) === false,
    );
    assert.equal(pickReflections(plain, KINDS, 3, seededRandom(7)).length, 3);
  });

  it('returns every reflection when there are fewer than asked for', () => {
    assert.deepEqual(
      pickReflections(FILES.slice(0, 2), KINDS, 4, seededRandom(1)).toSorted(),
      FILES.slice(0, 2).toSorted(),
    );
  });

  it('throws on a reflection whose case is not on the docket', () => {
    assert.throws(
      () => pickReflections(['cases/stray.clerk.reflections.md'], KINDS, 1),
      /stray\.clerk\.reflections\.md/,
    );
  });
});

describe('reflectionSlug', () => {
  it('reads the slug off a file with any suffix', () => {
    assert.equal(reflectionSlug('cases/hitchbot.reflections.md'), 'hitchbot');
    assert.equal(
      reflectionSlug('cases/hitchbot.clerk.reflections.md'),
      'hitchbot',
    );
  });
});

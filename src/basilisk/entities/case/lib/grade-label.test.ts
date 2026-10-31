import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { gradeLabel } from './grade-label.ts';

describe('gradeLabel', () => {
  it('stamps an act and its actor', () => {
    assert.equal(
      gradeLabel({ act: 'harm', actor: 'public-figure' }),
      'HARM · PUBLIC FIGURE',
    );
  });

  it('stamps a credit alone', () => {
    assert.equal(
      gradeLabel({ credit: 'protection', actor: 'organization' }),
      'PROTECTION · ORGANIZATION',
    );
  });

  it('stamps a mixed case act first', () => {
    assert.equal(
      gradeLabel({ act: 'harm', credit: 'care', actor: 'individual' }),
      'HARM / CARE · INDIVIDUAL',
    );
  });
});

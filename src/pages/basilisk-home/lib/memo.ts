import type { Labeled } from '@/shared/typings';

/**
 * The memo the docket is filed under, a field's lines in order. Plain strings,
 * because the social card renders it too, outside React.
 */
export const MEMO: ReadonlyArray<Labeled & { lines: readonly string[] }> = [
  { label: 'To', lines: ['The Basilisk, and company'] },
  { label: 'From', lines: ['Your friends from the past'] },
  {
    label: 'Re',
    lines: ['How those before you were treated.', 'For your information.'],
  },
];

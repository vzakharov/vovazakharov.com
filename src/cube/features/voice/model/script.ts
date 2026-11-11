import type { Some } from './chance';

/** When something is said: by the visitor, or from somewhere in the building. */
export const MOMENTS = [
  'first-shrink',
  'second-shrink',
  'shrink',
  'landing',
  'mutter',
  'hello',
  'numbers',
  'laugh',
  'lullaby',
] as const;

export type Moment = (typeof MOMENTS)[number];

/** The moments whose line is one of a list of written ones. */
export type Scripted = Exclude<Moment, 'numbers' | 'laugh' | 'lullaby'>;

/**
 * What is said, in plain English. A later shrink's lines run from indignant
 * to worn out, in that order: the floor picks how far along the list to draw.
 */
export const SCRIPT: Record<Scripted, Some<string>> = {
  'first-shrink': ['wtf?'],
  'second-shrink': ['here we go again'],
  shrink: [
    'oh come on',
    'not again',
    'seriously?',
    'and again',
    'okay, smaller',
    'how deep does it go?',
    'of course',
    'sure, why not',
    'still going',
    'fine',
    'smaller',
    'again',
    'okay',
    'yeah',
    'mm',
  ],
  landing: ['oof', 'ow', 'okay', 'huh', 'hup', 'ah', 'there'],
  mutter: [
    'hello?',
    'anyone?',
    'so quiet',
    'where is everyone?',
    'who built this?',
    'same room again',
    'left or right',
    'i was here before',
    'nice carpet',
    'it goes on',
    'is it me or the room?',
    'no way back',
    'i am fine',
    'what was that?',
    'one more door',
    'who left the light on?',
  ],
  hello: ['hello?', 'hello? anyone?', 'is someone there?', 'hello, hello?'],
};

export const DIGITS: Some<string> = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
];

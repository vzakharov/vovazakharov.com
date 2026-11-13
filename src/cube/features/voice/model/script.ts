import type { Some } from './chance';

/**
 * When something is heard. The visitor's seven are sounds without words; the
 * rest are said in words, by the building over its speakers or by someone
 * somewhere in it.
 */
export const MOMENTS = [
  'waking',
  'wonder',
  'first-shrink',
  'second-shrink',
  'shrink',
  'landing',
  'mutter',
  'announcement',
  'numbers',
  'hello',
  'laugh',
  'lullaby',
] as const;

export type Moment = (typeof MOMENTS)[number];

/** The moments whose line is one of a list of written ones. */
export type Scripted = Extract<Moment, 'announcement' | 'hello'>;

/** What is said in words, in plain English. */
export const SCRIPT: Record<Scripted, Some<string>> = {
  announcement: [
    'attention please',
    'this floor is now closed',
    'please go down to the next floor',
    'you are now smaller',
    'visitors please stay the same size',
    'this lift is out of order',
    'thank you for waiting',
    'will the owner of a small body please come back for it',
    'cleaning in progress',
    'all staff please come to the front desk',
    'there is no floor below this one',
    'the doors are closing',
    'have a nice way down',
    'please do not feed the chairs',
    'the building thanks you',
  ],
  hello: [
    'hello?',
    'hello? anyone?',
    'is someone there?',
    'hello, hello?',
    'where is everyone?',
    'who left the light on?',
  ],
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

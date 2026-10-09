import { type CreditedName, spelledNameSchema } from './people.ts';

const GENDERS = ['female', 'male'] as const;

/**
 * Whose voice a stanza is in, as each locale spells it. The gender is what a
 * reader of the words — a reflection on the song included — needs most and
 * cannot hear off the page; a project with no characters names a generic voice.
 */
export type Singer = CreditedName & { gender: (typeof GENDERS)[number] };

const SINGERS = [
  { en: 'Maya', ru: 'Майя', gender: 'female' },
  { en: 'Kirill', ru: 'Кирилл', gender: 'male' },
  { en: 'female voice', ru: 'женский голос', gender: 'female' },
  { en: 'male voice', ru: 'мужской голос', gender: 'male' },
] as const satisfies readonly Singer[];

/** A singer, in either spelling, checked against `SINGERS`. */
export const singerSchema = spelledNameSchema(SINGERS, 'SINGERS');

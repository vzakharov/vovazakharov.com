import { z } from 'zod';

import type { Locale } from '@/shared/i18n';

/** A credited person's name as each locale spells it. */
export type CreditedName = Record<Locale, string>;

/** Whoever a role the frontmatter leaves uncredited belongs to. */
export const SONG_AUTHOR = { en: 'Vova Zakharov', ru: 'Вова Захаров' } as const;

/**
 * Everyone a song's `credits` may name. A credit is written in either spelling,
 * whichever the author reached for, and shown in the reader's.
 */
const CREDITED_PEOPLE = [
  SONG_AUTHOR,
  { en: 'Vladimir Zakharov Sr.', ru: 'Владимир Захаров-старший' },
  { en: 'Sasha Zakharova', ru: 'Саша Захарова' },
  { en: 'Zoltan Zakharov', ru: 'Золтан Захаров' },
  { en: 'Traditional', ru: 'народные' },
  { en: 'Antonio Vivaldi', ru: 'Антонио Вивальди' },
  { en: 'Charlotte Brontë', ru: 'Шарлотта Бронте' },
  { en: 'Ferdinando Carulli', ru: 'Фердинандо Карулли' },
  { en: 'Jane Taylor', ru: 'Джейн Тейлор' },
  { en: 'My Chemical Romance', ru: 'My Chemical Romance' },
  { en: 'Nance Castro', ru: 'Нэнс Кастро' },
  { en: 'Omar Khayyam', ru: 'Омар Хайям' },
  { en: 'William Shakespeare', ru: 'Уильям Шекспир' },
  { en: 'Alexander Blok', ru: 'Александр Блок' },
  { en: 'Alexandra Kokotova', ru: 'Александра Кокотова' },
  { en: 'Andrey Mokrushin', ru: 'Андрей Мокрушин' },
  { en: 'Anna Akhmatova', ru: 'Анна Ахматова' },
  { en: 'Boris Pasternak', ru: 'Борис Пастернак' },
  { en: 'Viktor “Nixon” Sazonov', ru: 'Виктор «Никсон» Сазонов' },
  { en: 'Vladimir Mayakovsky', ru: 'Владимир Маяковский' },
  { en: 'Ivan Derbenyov', ru: 'Иван Дербенёв' },
  { en: 'Igor Golubev', ru: 'Игорь Голубев' },
  { en: 'K. R.', ru: 'К. Р.' },
  { en: 'Marina Tsvetaeva', ru: 'Марина Цветаева' },
  { en: 'Maria Koskova', ru: 'Мария Коськова' },
  { en: 'Mikhail Kozakov', ru: 'Михаил Козаков' },
  { en: 'Mikhail Lozinsky', ru: 'Михаил Лозинский' },
  { en: 'Mikhail Tanich', ru: 'Михаил Танич' },
  { en: 'Nikolay Zabolotsky', ru: 'Николай Заболоцкий' },
  { en: 'Nikolay Nekrasov', ru: 'Николай Некрасов' },
  { en: 'Samuil Marshak', ru: 'Самуил Маршак' },
  { en: 'Sergey Bakanov', ru: 'Сергей Баканов' },
  { en: 'Sergey Isaev', ru: 'Сергей Исаев' },
  { en: 'Sergey Korzhukov', ru: 'Сергей Коржуков' },
  {
    en: 'Slavik, Andrey Mokrushin’s friend',
    ru: 'Славик, друг Андрея Мокрушина',
  },
] as const satisfies readonly CreditedName[];

/**
 * A name written in either locale's spelling and read as its registry entry,
 * so a name the registry lacks fails the build rather than reaching a page in
 * the wrong alphabet. `registry` names the list to add a missing one to.
 */
export function spelledNameSchema<Entry extends CreditedName>(
  entries: readonly Entry[],
  registry: string,
) {
  const bySpelling = new Map<string, Entry>(
    entries.flatMap((entry) => [
      [entry.en, entry],
      [entry.ru, entry],
    ]),
  );

  return z.string().transform((spelling, context) => {
    const entry = bySpelling.get(spelling);

    if (entry === undefined) {
      context.addIssue({
        code: 'custom',
        message: `No one in ${registry} is spelled “${spelling}”; add them there.`,
      });

      return z.NEVER;
    }

    return entry;
  });
}

/** A credit, checked against the people above and read as both spellings. */
export const creditedNameSchema = spelledNameSchema(
  CREDITED_PEOPLE,
  'CREDITED_PEOPLE',
);

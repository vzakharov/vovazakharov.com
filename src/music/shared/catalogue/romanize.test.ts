import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { romanizeRussian } from './romanize.ts';

function spells(cases: Record<string, string>) {
  for (const [russian, latin] of Object.entries(cases)) {
    assert.equal(romanizeRussian(russian), latin, russian);
  }
}

describe('romanizeRussian', () => {
  it('spells the catalogue’s titles', () => {
    spells({
      'Ночной сад': 'Nochnoy sad',
      'Я куплю тебе дом': 'Ya kuplyu tebe dom',
      'Пегий пёс, бегущий краем моря': 'Pegiy pyos, begushchiy krayem morya',
      'Всё в этой жизни начинается с любви':
        'Vsyo v etoy zhizni nachinayetsya s lyubvi',
      'Не ветер бушует над бором…': 'Ne veter bushuyet nad borom…',
      'Однажды в студёную зимнюю пору…': 'Odnazhdy v studyonuyu zimnyuyu poru…',
    });
  });

  it('spells е as ye everywhere but after a consonant', () => {
    spells({
      'Мир, какой он есть': 'Mir, kakoy on yestʼ',
      'Доброе утро': 'Dobroye utro',
      Майе: 'Mayye',
      Снег: 'Sneg',
    });
  });

  it('spells ё as o after ж ч ш щ and as yo elsewhere', () => {
    spells({ жёлтый: 'zholty', шёл: 'shol', Ёлка: 'Yolka', Пёс: 'Pyos' });
  });

  it('reads ые and ый as one sound each', () => {
    spells({
      Полуживые: 'Poluzhivye',
      'Грёбаный бал': 'Gryobany bal',
      'Призрачный блюз': 'Prizrachny blyuz',
    });
  });

  it('spells the soft and hard signs as a modifier apostrophe', () => {
    spells({
      Двадцать: 'Dvadtsatʼ',
      подъезд: 'podʼyezd',
      соловьём: 'solovʼyom',
    });
  });

  it('capitalizes a digraph’s first letter, and a word in capitals whole', () => {
    spells({ Щи: 'Shchi', Чай: 'Chay', СССР: 'SSSR', ЩИ: 'SHCHI' });
  });

  it('passes everything that is not a Russian letter through', () => {
    spells({
      'Гамлет (Extended Version)': 'Gamlet (Extended Version)',
      '下马饮君酒，问君何所之？': '下马饮君酒，问君何所之？',
      'Часть 2 / _Poekhali!_': 'Chastʼ 2 / _Poekhali!_',
    });
  });
});

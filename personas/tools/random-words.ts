#!/usr/bin/env node

/**
 * The die: prints random `adjective noun` pairs to search on, one per line,
 * drawn from faker's English word lists so the draw carries nobody's taste:
 *
 *   pnpm random-words        # one pair
 *   pnpm random-words -n 5   # five
 */

import { faker } from '@faker-js/faker';
import { parseArgs } from 'node:util';
import { z } from 'zod';

const { values } = parseArgs({
  options: { n: { type: 'string', short: 'n', default: '1' } },
});

const count = z.coerce.number().int().positive().parse(values.n);

for (let i = 0; i < count; i++) {
  process.stdout.write(`${faker.word.adjective()} ${faker.word.noun()}\n`);
}

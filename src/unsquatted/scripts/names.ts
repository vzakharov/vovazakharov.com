/**
 * The mechanical half of the naming runbook (`RUNBOOK.md` beside this file):
 *
 *   pnpm names check < candidates.tsv   # axis<TAB>name lines
 *   pnpm names reject <axis> <domain>…  # free, but not picked
 *   pnpm names recheck                  # listed names no longer free
 *   pnpm names roll [count]             # word pairs, as the page's dice
 *
 * `check` looks each new candidate up exactly as the page does — in `.com`, or
 * in the zone a domain hack names — then asks the registrar (`lib/registrar.ts`)
 * about a name RDAP calls free, records a taken, premium or reserved one in the
 * ledger and prints every verdict as `<verdict><TAB>axis<TAB>domain`, only
 * `free` being pickable. `recheck` prints the listed names that are taken,
 * unanswered, premium or reserved. A lookup with no answer fails the run once the
 * rest are done, so a partial run never passes for a complete one.
 */

import { text } from 'node:stream/consumers';
import { setTimeout as sleep } from 'node:timers/promises';

import { errorClass } from '@/kernel/shared/lib/error-class';

import {
  checkDomain,
  LASTING_PICKS,
  PICKED_DOMAINS,
  rollName,
} from '@/unsquatted/pages/home/index.server-only';

import {
  appendToLedger,
  type Candidate,
  parseCandidates,
  readLedger,
  today,
  unchecked,
} from './lib/ledger.ts';
import { registrarOffer } from './lib/registrar.ts';

const UsageError = errorClass('UsageError');

const UnansweredError = errorClass('UnansweredError');

const ROLLS = 20;

/** Between lookups, so a run of a hundred stays polite to the registry. */
const PAUSE_MS = 300;

const say = (line: string) => process.stdout.write(`${line}\n`);

async function inTurn<T>(
  items: readonly T[],
  each: (item: T) => Promise<void>,
): Promise<void> {
  const [first, ...rest] = items;

  if (first === undefined) return;
  await each(first);
  await sleep(PAUSE_MS);
  await inTurn(rest, each);
}

/** A name RDAP calls free, as the registrar prices it, ledgered unless sold. */
async function priced({ axis, domain }: Candidate): Promise<string> {
  const offer = await registrarOffer(domain);

  if (offer.state === 'regular') return `free\t${axis}\t${domain}`;

  const verdict = offer.state === 'premium' ? 'premium' : 'reserved';

  appendToLedger({ domain, axis, verdict, checked: today() });

  return `${verdict}\t${axis}\t${domain}`;
}

async function check() {
  const known = [
    ...readLedger().map(({ domain }) => domain),
    ...PICKED_DOMAINS,
  ];
  const candidates = unchecked(
    parseCandidates(await text(process.stdin)),
    known,
  );
  const unanswered: string[] = [];

  await inTurn(candidates, async ({ axis, domain }) => {
    const verdict = await checkDomain(domain);

    if (verdict.state === 'taken') {
      const { since } = verdict;

      appendToLedger({
        domain,
        axis,
        verdict: 'taken',
        checked: today(),
        ...(since === undefined ? {} : { since }),
      });
      say(`taken\t${axis}\t${domain}`);
    } else if (verdict.state === 'unknown') {
      unanswered.push(domain);
    } else {
      // `maybe` is DNS's hint in a zone whose registry has no RDAP: no pick.
      say(
        verdict.state === 'free'
          ? await priced({ axis, domain })
          : `maybe\t${axis}\t${domain}`,
      );
    }
  });

  if (unanswered.length > 0) {
    throw new UnansweredError(`no answer for ${unanswered.join(', ')}`);
  }
}

function reject(axis: string | undefined, domains: readonly string[]) {
  if (axis === undefined || domains.length === 0) {
    throw new UsageError('usage: pnpm names reject <axis> <domain>…');
  }

  for (const domain of domains) {
    appendToLedger({ domain, axis, verdict: 'taste', checked: today() });
  }
}

async function recheck() {
  await inTurn(LASTING_PICKS, async ({ domain }) => {
    const { state } = await checkDomain(domain);

    if (state === 'taken' || state === 'unknown') {
      say(`${state}\t${domain}`);
    } else if (state === 'free') {
      const offer = await registrarOffer(domain);

      if (offer.state === 'premium') say(`premium ${offer.price}\t${domain}`);
      if (offer.state === 'unavailable') say(`reserved\t${domain}`);
    }
  });
}

async function roll(count: number) {
  const pairs = await Promise.all(
    Array.from({ length: count }, async () => rollName()),
  );

  for (const pair of pairs) say(pair);
}

const [command, ...args] = process.argv.slice(2);

const COMMANDS = {
  check,
  reject: () => {
    reject(args[0], args.slice(1));
  },
  recheck,
  roll: async () => roll(args[0] === undefined ? ROLLS : Number(args[0])),
};

const isCommand = (name: string): name is keyof typeof COMMANDS =>
  Object.hasOwn(COMMANDS, name);

if (command === undefined || !isCommand(command)) {
  throw new UsageError(
    `usage: pnpm names <${Object.keys(COMMANDS).join('|')}>`,
  );
}

await COMMANDS[command]();

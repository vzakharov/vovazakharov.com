/**
 * The mechanical half of the naming runbook (`RUNBOOK.md` beside this file):
 *
 *   pnpm names check < candidates.tsv   # axis<TAB>name lines
 *   pnpm names reject <axis> <domain>…  # free, but not picked
 *   pnpm names recheck                  # listed names no longer free
 *   pnpm names roll [count]             # word pairs, as the page's dice
 *
 * `check` looks each new candidate up in `.com` exactly as the page does,
 * records a taken one in the ledger and prints a free one as
 * `free<TAB>axis<TAB>domain`. A lookup with no answer fails the run once the
 * rest are done, so a partial run never passes for a complete one.
 */

import { text } from 'node:stream/consumers';

import { errorClass } from '@/kernel/shared/lib/error-class';

import {
  appendToLedger,
  parseCandidates,
  readLedger,
  today,
  unchecked,
} from './lib/ledger.ts';

import {
  checkDomain,
  LASTING_PICKS,
  PICKED_DOMAINS,
  rollName,
} from '@/unsquatted/pages/home/index.server-only';

const UsageError = errorClass('UsageError');

const UnansweredError = errorClass('UnansweredError');

const ROLLS = 20;

/** Between lookups, so a run of a hundred stays polite to the registry. */
const PAUSE_MS = 300;

const pause = () =>
  new Promise((resolve) => {
    setTimeout(resolve, PAUSE_MS);
  });

const say = (line: string) => process.stdout.write(`${line}\n`);

async function check() {
  const known = [...readLedger().map(({ domain }) => domain), ...PICKED_DOMAINS];
  const candidates = unchecked(parseCandidates(await text(process.stdin)), known);
  const unanswered: string[] = [];

  for (const { axis, domain } of candidates) {
    const verdict = await checkDomain(domain);

    if (verdict.state === 'taken') {
      appendToLedger({
        domain,
        axis,
        verdict: 'taken',
        checked: today(),
        ...(verdict.since === undefined
          ? {}
          : { since: verdict.since }),
      });
      say(`taken\t${axis}\t${domain}`);
    } else if (verdict.state === 'unknown') {
      unanswered.push(domain);
    } else {
      say(`free\t${axis}\t${domain}`);
    }

    await pause();
  }

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
  for (const { domain } of LASTING_PICKS) {
    const verdict = await checkDomain(domain);

    if (verdict.state === 'taken' || verdict.state === 'unknown') {
      say(`${verdict.state}\t${domain}`);
    }

    await pause();
  }
}

async function roll(count: number) {
  for (let index = 0; index < count; index += 1) {
    say(await rollName());
  }
}

const [command, ...args] = process.argv.slice(2);

switch (command) {
  case 'check': {
    await check();
    break;
  }
  case 'reject': {
    reject(args[0], args.slice(1));
    break;
  }
  case 'recheck': {
    await recheck();
    break;
  }
  case 'roll': {
    await roll(args[0] === undefined ? ROLLS : Number(args[0]));
    break;
  }
  default: {
    throw new UsageError('usage: pnpm names <check|reject|recheck|roll>');
  }
}

import { z } from 'zod';

import type { Talking } from './cdp.ts';

const ConsoleCalled = z.object({
  type: z.string(),
  args: z.array(
    z.object({
      value: z.unknown().optional(),
      description: z.string().optional(),
    }),
  ),
});

const LogEntry = z.object({
  entry: z.object({
    level: z.string(),
    text: z.string(),
    url: z.string().optional(),
  }),
});

/**
 * Hands `report` the errors a page says rather than throws: each
 * `console.error`, and each error the browser logs itself — a failed load, a
 * blocked request. A thrown one reaches `openTab`'s `onError` instead.
 */
export async function watchPageErrors(
  tab: Talking,
  report: (message: string) => void,
): Promise<void> {
  tab.on('Runtime.consoleAPICalled', (params) => {
    const { type, args } = ConsoleCalled.parse(params);
    if (type !== 'error') return;
    report(
      `console.error: ${args.map((arg) => arg.description ?? String(arg.value)).join(' ')}`,
    );
  });
  tab.on('Log.entryAdded', (params) => {
    const { entry } = LogEntry.parse(params);
    if (entry.level !== 'error') return;
    report(`${entry.text}${entry.url === undefined ? '' : ` (${entry.url})`}`);
  });
  await tab.send('Log.enable');
}

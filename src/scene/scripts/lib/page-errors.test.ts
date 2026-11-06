import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { watchPageErrors } from './page-errors.ts';

/** A tab that records what is sent to it and fires the events it is handed. */
function fakeTab() {
  const listeners = new Map<string, Array<(params: unknown) => void>>();
  const sent: string[] = [];
  return {
    sent,
    fire: (event: string, params: unknown) => {
      for (const listener of listeners.get(event) ?? []) listener(params);
    },
    on: (event: string, listener: (params: unknown) => void) => {
      listeners.set(event, [...(listeners.get(event) ?? []), listener]);
    },
    send: async (method: string): Promise<unknown> => {
      sent.push(method);
      await Promise.resolve();
      return {};
    },
  };
}

async function watched() {
  const tab = fakeTab();
  const reported: string[] = [];
  await watchPageErrors(tab, (message) => {
    reported.push(message);
  });
  return { tab, reported };
}

describe('watchPageErrors', () => {
  it('enables the browser log it listens to', async () => {
    const { tab } = await watched();
    assert.deepEqual(tab.sent, ['Log.enable']);
  });

  it("reports a console.error with each argument's description or value", async () => {
    const { tab, reported } = await watched();
    tab.fire('Runtime.consoleAPICalled', {
      type: 'error',
      args: [{ value: 'tile' }, { description: 'Error: lost' }, { value: 3 }],
    });
    assert.deepEqual(reported, ['console.error: tile Error: lost 3']);
  });

  it('ignores every other console call', async () => {
    const { tab, reported } = await watched();
    tab.fire('Runtime.consoleAPICalled', { type: 'warning', args: [] });
    tab.fire('Runtime.consoleAPICalled', { type: 'log', args: [] });
    assert.deepEqual(reported, []);
  });

  it('reports an error the browser logs, with its URL when it has one', async () => {
    const { tab, reported } = await watched();
    tab.fire('Log.entryAdded', {
      entry: { level: 'error', text: 'Failed to load', url: '/x.js' },
    });
    tab.fire('Log.entryAdded', { entry: { level: 'error', text: 'Blocked' } });
    tab.fire('Log.entryAdded', { entry: { level: 'warning', text: 'Slow' } });
    assert.deepEqual(reported, ['Failed to load (/x.js)', 'Blocked']);
  });
});

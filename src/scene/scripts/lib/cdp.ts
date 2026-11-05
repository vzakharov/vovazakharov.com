/**
 * A headless Chromium driven over the DevTools protocol with Node's own
 * `WebSocket`, for the scripts that have to play a page rather than print it:
 * the project keeps no Playwright or Puppeteer dependency.
 */

import { type ChildProcess, spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { z } from 'zod';

import { findChromium } from '@/kernel/scripts/lib/chromium';

/** A reply to a command when it carries an `id`, an event when a `method`. */
const Message = z.object({
  id: z.number().optional(),
  method: z.string().optional(),
  params: z.unknown().optional(),
  result: z.unknown().optional(),
  error: z.object({ message: z.string() }).optional(),
  sessionId: z.string().optional(),
});

type Pending = {
  resolve: (result: unknown) => void;
  reject: (error: Error) => void;
};

type Listener = (params: unknown, sessionId: string | undefined) => void;

export type Browser = {
  /** Sends a command, to a page when `sessionId` names its session. */
  send: (
    method: string,
    params?: object,
    sessionId?: string,
  ) => Promise<unknown>;
  on: (event: string, listener: Listener) => void;
  /** Stops Chromium and removes its profile once it has exited. */
  close: () => Promise<void>;
};

const Thrown = z.object({
  exceptionDetails: z.object({
    text: z.string(),
    exception: z.object({ description: z.string() }).optional(),
  }),
});
const Evaluated = z.object({
  result: z.object({ value: z.unknown().optional() }),
  exceptionDetails: z
    .object({ exception: z.object({ description: z.string() }).optional() })
    .optional(),
});

/** A page a script can read values out of. */
export type Evaluating = {
  /** The expression's value, parsed; a throw in the page rejects. */
  evaluate: <Parsed>(
    expression: string,
    schema: z.ZodType<Parsed>,
  ) => Promise<Parsed>;
};

/** One page, in a browser context of its own so its storage is its own. */
export type Tab = Evaluating & {
  readonly contextId: string;
  /** Sends a command to this page. */
  send: (method: string, params?: object) => Promise<unknown>;
};

/**
 * Opens a blank page with `Runtime` and `Page` enabled, handing the first line
 * of every uncaught exception in it to `onError` — a page's own errors never
 * reach the script otherwise.
 */
export async function openTab(
  browser: Browser,
  onError: (message: string) => void,
): Promise<Tab> {
  const { browserContextId: contextId } = z
    .object({ browserContextId: z.string() })
    .parse(await browser.send('Target.createBrowserContext'));
  const target = z.object({ targetId: z.string() }).parse(
    await browser.send('Target.createTarget', {
      url: 'about:blank',
      browserContextId: contextId,
    }),
  );
  const { sessionId } = z
    .object({ sessionId: z.string() })
    .parse(
      await browser.send('Target.attachToTarget', { ...target, flatten: true }),
    );
  const send = async (method: string, params: object = {}) =>
    browser.send(method, params, sessionId);
  browser.on('Runtime.exceptionThrown', (params, from) => {
    if (from !== sessionId) return;
    const { exceptionDetails } = Thrown.parse(params);
    const said =
      exceptionDetails.exception?.description ?? exceptionDetails.text;
    onError(said.split('\n')[0] ?? said);
  });
  await send('Runtime.enable');
  await send('Page.enable');
  return {
    contextId,
    send,
    evaluate: async (expression, schema) => {
      const reply = Evaluated.parse(
        await send('Runtime.evaluate', { expression, returnByValue: true }),
      );
      if (reply.exceptionDetails) {
        throw new Error(
          `${expression}: ${reply.exceptionDetails.exception?.description ?? 'threw'}`,
        );
      }
      return schema.parse(reply.result.value);
    },
  };
}

/** The DevTools endpoint Chromium prints to stderr once it listens. */
async function endpoint(chrome: ChildProcess): Promise<string> {
  return new Promise((resolve, reject) => {
    let seen = '';
    chrome.stderr?.on('data', (chunk: Buffer) => {
      seen += chunk.toString();
      const url = /DevTools listening on (ws:\/\/\S+)/.exec(seen)?.[1];
      if (url !== undefined) resolve(url);
    });
    chrome.once('exit', (code) => {
      reject(
        new Error(
          `Chromium exited (${String(code)}) before listening:\n${seen}`,
        ),
      );
    });
  });
}

/**
 * Starts Chromium with WebGL on the software rasterizer, which is what a
 * container without a GPU can draw a canvas game with.
 */
export async function launch(): Promise<Browser> {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-'));
  const chrome = spawn(
    findChromium(),
    [
      '--headless=new',
      '--no-sandbox',
      '--remote-debugging-port=0',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--hide-scrollbars',
      `--user-data-dir=${profile}`,
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  );
  const socket = new WebSocket(await endpoint(chrome));
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  let nextId = 1;
  const pending = new Map<number, Pending>();
  const listeners = new Map<string, Listener[]>();
  socket.addEventListener('message', (event) => {
    const message = Message.parse(JSON.parse(String(event.data)));
    if (message.id !== undefined) {
      const waiting = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) waiting?.reject(new Error(message.error.message));
      else waiting?.resolve(message.result);
      return;
    }
    for (const listener of listeners.get(message.method ?? '') ?? []) {
      listener(message.params, message.sessionId);
    }
  });

  return {
    send: async (method, params, sessionId) =>
      new Promise((resolve, reject) => {
        const id = nextId++;
        pending.set(id, { resolve, reject });
        socket.send(
          JSON.stringify({ id, method, params: params ?? {}, sessionId }),
        );
      }),
    on: (event, listener) => {
      listeners.set(event, [...(listeners.get(event) ?? []), listener]);
    },
    close: async () => {
      socket.close();
      const exited = once(chrome, 'exit');
      chrome.kill();
      await exited;
      fs.rmSync(profile, { recursive: true, force: true });
    },
  };
}

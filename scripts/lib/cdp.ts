/**
 * A headless Chromium driven over the DevTools protocol with Node's own
 * `WebSocket`, for the scripts that have to play a page rather than print it:
 * the project keeps no Playwright or Puppeteer dependency. Bare Node runs its
 * callers, so this file stays free of syntax the type stripper cannot erase.
 */

import { type ChildProcess, spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { z } from 'zod';

import { findChromium } from './chromium.ts';

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

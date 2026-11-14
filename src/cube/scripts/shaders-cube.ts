/**
 * Compiles every floor's shader and every outdoor one in a headless Chromium's
 * WebGPU and prints
 * what the compiler says of each that fails — seconds, where finding the same
 * error on the page takes a dev server and a walk to the floor.
 *
 *   pnpm shaders:cube              # every floor
 *   pnpm shaders:cube --floor 12   # one
 */

import http from 'node:http';
import { z } from 'zod';

import { DEEPEST_FLOOR } from '@/cube/entities/world';
import { outdoorSources, shaderOf } from '@/cube/pages/cube/index.node-safe';

import { flag } from '@/kernel/scripts/lib/argv';
import { launch, openTab, WEBGPU_FLAGS } from '@/scene/scripts/lib/cdp';

/** What the page answers for one shader: its errors, each on a line. */
const Verdict = z.array(z.string());

/**
 * Page source compiling `code` on the device `window.device` holds, resolving
 * to its errors.
 */
const compiling = (code: string): string => `(async () => {
  window.device ??= await (await navigator.gpu.requestAdapter()).requestDevice();
  const module = (await window.device).createShaderModule({ code: ${JSON.stringify(code)} });
  const { messages } = await module.getCompilationInfo();
  return messages
    .filter(({ type }) => type === 'error')
    .map(({ lineNum, linePos, message }) => lineNum + ':' + linePos + ' ' + message);
})()`;

/** `source`'s line `at`, with the two either side of it. */
function around(source: string, at: number): string {
  return source
    .split('\n')
    .map((line, index) => `${String(index + 1).padStart(5)}  ${line}`)
    .slice(Math.max(0, at - 3), at + 2)
    .join('\n');
}

const floorOf = (n: number) => ({
  name: `floor ${String(n)}`,
  source: shaderOf(n),
});

async function main(): Promise<void> {
  const only = flag('floor');
  const shaders =
    only === undefined
      ? [
          ...Array.from({ length: DEEPEST_FLOOR }, (_, index) =>
            floorOf(index + 1),
          ),
          ...outdoorSources().map(({ name, source }) => ({
            name: `outdoor ${name}`,
            source,
          })),
        ]
      : [floorOf(Number(only))];
  // WebGPU is there only in a secure context, which localhost is.
  const server = http.createServer((_, response) => {
    response.setHeader('content-type', 'text/html');
    response.end('<!doctype html><title>shaders</title>');
  });
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = z.object({ port: z.number() }).parse(server.address());
  const browser = await launch(WEBGPU_FLAGS);
  try {
    const tab = await openTab(browser, (message) => {
      throw new Error(message);
    });
    await tab.send('Page.navigate', {
      url: `http://localhost:${String(port)}/`,
    });
    await tab.evaluate(
      `new Promise((done) => document.readyState === 'complete' ? done(true) : addEventListener('load', () => done(true)))`,
      z.boolean(),
      { awaitPromise: true },
    );
    const verdicts = await Promise.all(
      shaders.map(async ({ name, source }) => {
        const errors = await tab.evaluate(compiling(source), Verdict, {
          awaitPromise: true,
        });
        return { name, source, errors };
      }),
    );
    const failed = verdicts.filter(({ errors }) => errors.length > 0);
    for (const { name, source, errors } of failed) {
      process.stdout.write(`${name}\n`);
      for (const error of errors) {
        const line = Number(error.split(':')[0]);
        process.stdout.write(`  ${error}\n${around(source, line)}\n`);
      }
    }
    process.stdout.write(
      `${String(verdicts.length - failed.length)} of ${String(verdicts.length)} shaders compile\n`,
    );
    if (failed.length > 0) process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
}

await main();

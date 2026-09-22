/**
 * Where a print fetches its pages from: a `next dev` of this run's own, one
 * already up, or the static export served the way its host serves it.
 *
 * **Only the export shape prints what a deploy publishes.** A dev server agrees
 * with it while nothing hydrates visible text, which is the invariant
 * `.claude/rules/i18n.md` holds — a subtree rendered on the client prints
 * decoration the export never draws, link underlines included, and nothing here
 * can see the difference. So a PDF that ships comes off the export, and the
 * other two shapes are for looking at a page while working on it.
 */

/* eslint-disable no-console -- stdout is the calling script's interface, and
   the wait for a server is what a human watching a render run reads. The rule
   stays `error` in the app, where a stray log ships to a user. */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

import { REPO_ROOT } from './content-tree.ts';

/** Which of the three shapes a run prints from. */
export type PrintOrigin =
  | { serve: 'dev'; site: string }
  | { serve: 'url'; origin: string }
  | { serve: 'export'; dir: string };

/** A server the run can print from, and whatever it takes to let it go. */
type Running = {
  origin: string;
  /** Absent for a server the run did not start and has no business stopping. */
  close?: () => void;
};

/** How long a server gets to answer before the run is abandoned. */
const SERVE_TIMEOUT_MS = 120_000;

/** How often the wait for a server retries. */
const POLL_INTERVAL_MS = 500;

/** What a static host answers with, by extension; anything else is a download. */
const CONTENT_TYPES: Record<string, string> = {
  '.avif': 'image/avif',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.on('error', reject);
    server.listen(0, () => {
      const address = server.address();

      if (address === null || typeof address === 'string') {
        reject(new Error('The OS gave no port to render on.'));
        return;
      }

      server.close(() => {
        resolve(address.port);
      });
    });
  });
}

/**
 * A served page, read to the end. Draining the body matters: an unread response
 * leaves the socket half-consumed, and a dev server closes it under the next
 * request — which surfaces as a socket error rather than as a retry.
 */
async function served(url: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    await response.arrayBuffer();

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Waits for a spawned server to answer at all — it refuses connections until it
 * is listening, then pays a compile cost, so the wait is a poll. Each route's
 * own first compile needs no such warm-up: it happens inside Chromium's
 * request, which waits for it like any client.
 */
async function awaitServer(
  origin: string,
  server: ReturnType<typeof spawn>,
  site: string,
  deadline: number = Date.now() + SERVE_TIMEOUT_MS,
): Promise<void> {
  if (await served(origin)) return;

  if (server.exitCode !== null) {
    throw new Error(
      `The dev server exited with ${server.exitCode} before answering on ` +
        `${origin}. Run \`pnpm dev:${site}\` to see why.`,
    );
  }

  if (Date.now() > deadline) {
    throw new Error(`The dev server did not answer on ${origin}.`);
  }

  await sleep(POLL_INTERVAL_MS);

  return awaitServer(origin, server, site, deadline);
}

function stop(server: ReturnType<typeof spawn>): void {
  if (server.pid !== undefined && server.exitCode === null) {
    process.kill(-server.pid, 'SIGTERM');
  }
}

/**
 * Next is spawned directly and into a process group of its own, so the whole
 * server goes down with the run. Through `pnpm` the kill would reach only the
 * wrapper, and the `next dev` it left behind holds `.next/dev/lock` against
 * every later run — which is the collision `--origin` exists to sidestep when
 * the operator already has one up.
 */
async function devServer(site: string): Promise<Running> {
  const port = await freePort();
  const origin = `http://localhost:${port}`;
  const server = spawn(
    path.join(REPO_ROOT, 'node_modules', '.bin', 'next'),
    ['dev', '--port', String(port)],
    { stdio: 'ignore', detached: true },
  );

  console.log(`  waiting for the dev server on ${origin} …`);

  try {
    await awaitServer(origin, server, site);
  } catch (error) {
    stop(server);
    throw error;
  }

  return {
    origin,
    close: () => {
      stop(server);
    },
  };
}

async function existingServer(origin: string): Promise<Running> {
  if (!(await served(origin))) {
    throw new Error(
      `Nothing answered on ${origin}. Start the site's dev server first, or ` +
        'drop `--origin` to have this run spawn one.',
    );
  }

  return { origin };
}

/**
 * The file a static host would answer with. `trailingSlash` is unset, so the
 * export writes `out/case-studies/playgram.html` for `/case-studies/playgram`
 * — the extension-less request is the ordinary one, and the literal file and
 * the directory index are the other two shapes a host tries.
 */
function resolveFile(root: string, url: string): string | undefined {
  const requested = decodeURIComponent(
    new URL(url, 'http://localhost').pathname,
  );
  const target = path.resolve(root, `.${requested}`);

  if (target !== root && !target.startsWith(root + path.sep)) return undefined;

  return [target, `${target}.html`, path.join(target, 'index.html')].find(
    (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
  );
}

/**
 * The export served the way its host serves it. Hand-written rather than taken
 * from a package: the whole of what a print needs is the path resolution above
 * and a content type, and a served file whose type is wrong is a page printed
 * without its stylesheet.
 */
async function exportServer(dir: string): Promise<Running> {
  if (!fs.existsSync(dir)) {
    throw new Error(
      `No static export at ${dir} — build the site before printing from it.`,
    );
  }

  const server = http.createServer((request, response) => {
    const file = resolveFile(dir, request.url ?? '/');

    if (file === undefined) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end(`Nothing in the export answers ${request.url}\n`);
      return;
    }

    response.writeHead(200, {
      'content-type':
        CONTENT_TYPES[path.extname(file).toLowerCase()] ??
        'application/octet-stream',
    });

    const body = fs.createReadStream(file);

    // Past the headers there is no status left to report with, so the failure
    // is surfaced by killing the connection — which reaches Chromium as the
    // failed load it is — and named on stderr for whoever reads the run.
    body.on('error', (error) => {
      console.error(`  failed to serve ${file}: ${error.message}`);
      response.destroy(error);
    });

    body.pipe(response);
  });

  await new Promise<void>((resolve) => {
    server.listen(0, resolve);
  });

  const address = server.address();

  if (address === null || typeof address === 'string') {
    throw new Error('The OS gave no port to serve the export on.');
  }

  return {
    origin: `http://localhost:${address.port}`,
    close: () => {
      server.closeAllConnections();
      server.close();
    },
  };
}

async function start(choice: PrintOrigin): Promise<Running> {
  switch (choice.serve) {
    case 'dev': {
      return devServer(choice.site);
    }
    case 'url': {
      return existingServer(choice.origin);
    }
    case 'export': {
      return exportServer(choice.dir);
    }
    default: {
      throw new Error(`Unknown print origin: ${JSON.stringify(choice)}`);
    }
  }
}

/** Brings the chosen server up, hands `run` its origin, and takes it down again. */
export async function withPrintOrigin(
  choice: PrintOrigin,
  run: (origin: string) => Promise<void>,
): Promise<void> {
  const running = await start(choice);

  try {
    await run(running.origin);
  } finally {
    running.close?.();
  }
}

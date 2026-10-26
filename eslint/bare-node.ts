import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { z } from 'zod';

const manifestSchema = z.object({
  scripts: z.record(z.string(), z.string()).default({}),
});

/** `node <file>.ts` in a script's command line: Node strips the types itself. */
const NODE_ENTRY = /\bnode\s+([\w./-]+\.ts)\b/g;

/**
 * Every file bare Node runs from a `package.json` script under `root`: each
 * `node <file>.ts` entry and whatever it reaches by relative import. Bare Node
 * follows no `@/` alias, so these files reach across `src/` relatively — and a
 * value import by alias in one of them is a crash at run time, not a lint
 * finding, which is why the set is derived rather than listed.
 */
export function bareNodeFiles(root: string): ReadonlySet<string> {
  const { scripts } = manifestSchema.parse(
    JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')),
  );
  const pending = Object.entries(scripts).flatMap(([name, command]) =>
    [...command.matchAll(NODE_ENTRY)].map(([, entry]) => {
      const file = path.resolve(root, entry!);
      if (!existsSync(file)) {
        throw new Error(
          `bare-node: script "${name}" runs ${entry}, which does not exist`,
        );
      }
      return file;
    }),
  );

  const found = new Set<string>();
  for (let file = pending.pop(); file !== undefined; file = pending.pop()) {
    if (found.has(file) || !existsSync(file)) continue;
    found.add(file);
    for (const { fileName } of ts.preProcessFile(
      readFileSync(file, 'utf8'),
      true,
      true,
    ).importedFiles) {
      if (fileName.startsWith('.')) {
        pending.push(path.resolve(path.dirname(file), fileName));
      }
    }
  }
  return found;
}

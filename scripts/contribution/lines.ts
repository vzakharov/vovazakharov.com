/**
 * Lines of code per file extension over a range of commits, cumulative, for a
 * cumulative-flow chart. Reads the output of
 * `git log --reverse --numstat --format=@%H %cI`: a header line per commit,
 * then one `added<TAB>deleted<TAB>path` line per file it touched.
 */

export type Commit = { sha: string; committedAt: string };
export type FlowRow = Commit & { lines: Record<string, number> };

/** A binary file is `-` in both counts and carries no lines. */
const count = (field: string): number =>
  field === '-' ? 0 : Number.parseInt(field, 10);

/** The path a numstat line ends on after a rename: `a => b` and
 * `dir/{a => b}/file` both name the new side. */
export function renamedTo(field: string): string {
  const braced = /^(.*)\{[^{}]* => ([^{}]*)\}(.*)$/u.exec(field);
  if (braced) {
    const [, head = '', to = '', tail = ''] = braced;
    return `${head}${to}${tail}`.replaceAll('//', '/');
  }
  const bare = field.split(' => ');
  return bare.at(-1) ?? field;
}

/** `.ts`, `.md`, …; a dotfile or a file with no dot is grouped by its name. */
export function extensionOf(file: string): string {
  const base = file.split('/').at(-1) ?? file;
  const dot = base.lastIndexOf('.');
  return dot > 0 ? base.slice(dot) : base;
}

export function cumulativeFlow(log: string): FlowRow[] {
  const rows: FlowRow[] = [];
  const totals: Record<string, number> = {};
  let current: Commit | undefined;
  const flush = (): void => {
    if (current) rows.push({ ...current, lines: { ...totals } });
  };
  for (const line of log.split('\n')) {
    if (line.startsWith('@')) {
      flush();
      const [sha = '', committedAt = ''] = line.slice(1).split(' ');
      current = { sha, committedAt };
      continue;
    }
    const fields = line.split('\t');
    if (fields.length !== 3) continue;
    const [added = '', deleted = '', file = ''] = fields;
    const extension = extensionOf(renamedTo(file));
    totals[extension] =
      (totals[extension] ?? 0) + count(added) - count(deleted);
  }
  flush();
  return rows;
}

/** One row per commit, one column per extension, extensions by final size. */
export function toCsv(rows: readonly FlowRow[]): string {
  const last = rows.at(-1)?.lines ?? {};
  const extensions = Object.keys(last).toSorted(
    (a, b) => (last[b] ?? 0) - (last[a] ?? 0),
  );
  const header = ['date', 'sha', ...extensions].join(',');
  const body = rows.map((row) =>
    [
      row.committedAt,
      row.sha.slice(0, 8),
      ...extensions.map((ext) => row.lines[ext] ?? 0),
    ].join(','),
  );
  return [header, ...body, ''].join('\n');
}

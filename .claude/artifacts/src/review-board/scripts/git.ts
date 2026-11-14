import { spawnSync } from "node:child_process";

const MAX_BUFFER = 1 << 30;

type Outcome =
  | { ok: true; stdout: Buffer }
  | { ok: false; status: number | null; reason: string };

export function run(
  cwd: string,
  command: string,
  args: string[],
  input?: string,
): Outcome {
  const result = spawnSync(command, args, {
    cwd,
    maxBuffer: MAX_BUFFER,
    ...(input === undefined ? {} : { input }),
  });
  if (result.error)
    return { ok: false, status: null, reason: result.error.message };
  if (result.status !== 0)
    return {
      ok: false,
      status: result.status,
      reason: result.stderr.toString("utf8").trim(),
    };
  return { ok: true, stdout: result.stdout };
}

export function git(cwd: string, args: string[], input?: string): Buffer {
  const outcome = run(cwd, "git", args, input);
  if (!outcome.ok)
    throw new Error(`git ${args.join(" ")} failed: ${outcome.reason}`);
  return outcome.stdout;
}

export function gitText(cwd: string, args: string[], input?: string): string {
  return git(cwd, args, input).toString("utf8");
}

/** The command's trimmed stdout, or null when it is unavailable or exits non-zero. */
export function tryText(
  cwd: string,
  command: string,
  args: string[],
): string | null {
  const outcome = run(cwd, command, args);
  if (!outcome.ok) return null;
  return outcome.stdout.toString("utf8").trim() || null;
}

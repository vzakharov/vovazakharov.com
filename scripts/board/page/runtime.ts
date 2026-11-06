/**
 * The slice of the artifact runtime the board uses — `db`, `user`, `assets` —
 * typed structurally after the platform's own declarations, and reached
 * through guards rather than casts: a view outside claude.ai (a local file, the
 * snapshot) has no `claude` at all, and each namespace may resolve `null`.
 */

type Snapshot = {
  id: string;
  data: () => Record<string, unknown> | undefined;
};
type QuerySnapshot = {
  docs: Snapshot[];
  metadata: { fromCache: boolean };
};
type DbError = { code: string; message: string };

export type Db = {
  collection: (path: string) => {
    doc: (id: string) => {
      set: (data: Record<string, unknown>) => Promise<void>;
    };
    onSnapshot: (
      next: (snap: QuerySnapshot) => void,
      error: (e: DbError) => void,
    ) => () => void;
  };
};

export type User = {
  id: () => Promise<string | null>;
  can: (capability: string) => Promise<boolean | null>;
  profiles: (
    ids: readonly string[],
  ) => Promise<Record<string, { name: string }>>;
};

export type Assets = {
  upload: (blob: Blob) => Promise<{ id: string }>;
};

type Runtime = { use: (name: string) => Promise<unknown> };

const hasFunctions = (value: unknown, names: readonly string[]): boolean =>
  typeof value === 'object' &&
  value !== null &&
  names.every((name) => typeof Reflect.get(value, name) === 'function');

const isRuntime = (value: unknown): value is Runtime =>
  hasFunctions(value, ['use']);
const isDb = (value: unknown): value is Db =>
  hasFunctions(value, ['collection', 'doc']);
const isUser = (value: unknown): value is User =>
  hasFunctions(value, ['id', 'can', 'profiles']);
const isAssets = (value: unknown): value is Assets =>
  hasFunctions(value, ['upload']);

export type Capabilities = {
  db: Db | null;
  user: User | null;
  assets: Assets | null;
};

/** Every capability this view can run; all `null` outside claude.ai. */
export async function connect(): Promise<Capabilities> {
  const runtime: unknown = Reflect.get(globalThis, 'claude');
  if (!isRuntime(runtime)) return { db: null, user: null, assets: null };
  const [db, user, assets] = await Promise.all(
    ['db', 'user', 'assets'].map(async (name) => runtime.use(name)),
  );
  return {
    db: isDb(db) ? db : null,
    user: isUser(user) ? user : null,
    assets: isAssets(assets) ? assets : null,
  };
}

/** A rejection's `code`, the runtime's stable error name. */
export const errorCode = (error: unknown): string => {
  const code: unknown =
    typeof error === 'object' && error !== null
      ? Reflect.get(error, 'code')
      : undefined;
  return typeof code === 'string' ? code : 'unknown';
};

import * as z from "zod/mini";
import {
  type Variant,
  variantSchema,
} from "#src/blind-test/shared/blind-set/index.ts";

/** Each piece's verdict is a doc here, keyed by the piece's id, so Claude lists the collection to read them. */
const VERDICTS = "verdicts";

const verdictSchema = z.object({ pick: variantSchema });

/** The variant picked per piece id; a piece with none picked is absent. */
export type Verdicts = ReadonlyMap<string, Variant>;

export type SaveState = "saving" | "saved";

export interface VerdictStore {
  /** Writes a piece's pick, or clears it on null. */
  pick(pieceId: string, variant: Variant | null): void;
}

export interface VerdictListeners {
  /** Every verdict, the viewer's unsaved picks included, on each change. */
  verdicts: (verdicts: Verdicts) => void;
  saveState: (state: SaveState) => void;
  error: (error: unknown) => void;
}

function claudeRuntime(): Claude | null {
  return "claude" in window ? window.claude : null;
}

function withPick(
  verdicts: Verdicts,
  pieceId: string,
  variant: Variant | null,
): Verdicts {
  const next = new Map(verdicts);
  if (variant === null) next.delete(pieceId);
  else next.set(pieceId, variant);
  return next;
}

/** The verdicts kept for the visit alone, where the view has no `db`. */
export function localVerdicts(on: VerdictListeners): VerdictStore {
  let verdicts: Verdicts = new Map();
  return {
    pick(pieceId, variant) {
      verdicts = withPick(verdicts, pieceId, variant);
      on.verdicts(verdicts);
    },
  };
}

/**
 * The verdicts in the artifact's `db`, or null when this view has none (opened
 * off disk, signed out, outside the organization).
 */
export async function connectVerdicts(
  on: VerdictListeners,
): Promise<VerdictStore | null> {
  const runtime = claudeRuntime();
  if (runtime === null) return null;
  const db = await runtime.use("db");
  if (db === null) return null;

  let stored: Verdicts = new Map();
  // Picks not yet confirmed by a snapshot, null being a clear.
  const pending = new Map<string, Variant | null>();
  // One write in flight per doc: each waits for the one before it.
  const writes = new Map<string, Promise<void>>();

  const publish = () => {
    let shown = stored;
    for (const [pieceId, variant] of pending) {
      shown = withPick(shown, pieceId, variant);
    }
    on.verdicts(shown);
  };

  db.collection(VERDICTS).onSnapshot((snap) => {
    const next = new Map<string, Variant>();
    for (const doc of snap.docs) {
      const parsed = verdictSchema.safeParse(doc.data());
      if (parsed.success) next.set(doc.id, parsed.data.pick);
      else on.error(new Error(`verdict ${doc.id}: ${parsed.error.message}`));
    }
    stored = next;
    publish();
  }, on.error);

  return {
    pick(pieceId, variant) {
      pending.set(pieceId, variant);
      publish();
      on.saveState("saving");
      const ref = db.doc(`${VERDICTS}/${pieceId}`);
      const previous = writes.get(pieceId) ?? Promise.resolve();
      const next = previous
        .then(async () =>
          variant === null ? ref.delete() : ref.set({ pick: variant }),
        )
        .then(() => {
          if (pending.get(pieceId) === variant) pending.delete(pieceId);
          if (pending.size === 0) on.saveState("saved");
        })
        .catch(on.error);
      writes.set(pieceId, next);
    },
  };
}

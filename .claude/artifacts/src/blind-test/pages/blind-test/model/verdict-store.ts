import * as z from "zod/mini";

/** Each piece's verdict is a doc here, keyed by the piece's id, so Claude lists the collection to read them. */
const VERDICTS = "verdicts";
/** A verdict is written this long after the last keystroke. */
const SAVE_DELAY_MS = 600;

const verdictSchema = z.object({ text: z.string() });

/** Free text per piece id, as typed: "B > A > C". */
export type Verdicts = ReadonlyMap<string, string>;

export type SaveState = "saving" | "saved";

export interface VerdictStore {
  /** Records a viewer's edit and writes it once they pause. */
  edit(pieceId: string, text: string): void;
}

export interface VerdictListeners {
  /** Every verdict, the viewer's unsaved edits included, on each change. */
  verdicts: (verdicts: Verdicts) => void;
  saveState: (state: SaveState) => void;
  error: (error: unknown) => void;
}

function claudeRuntime(): Claude | null {
  return "claude" in window ? window.claude : null;
}

/**
 * The verdicts in the artifact's `db`, or null when this view has none (opened
 * off disk, signed out, outside the organization) — the page then keeps no
 * verdict past the visit.
 */
export async function connectVerdicts(
  on: VerdictListeners,
): Promise<VerdictStore | null> {
  const runtime = claudeRuntime();
  if (runtime === null) return null;
  const db = await runtime.use("db");
  if (db === null) return null;

  const stored = new Map<string, string>();
  const edits = new Map<string, string>();
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  // One write in flight per doc: each waits for the one before it.
  const writes = new Map<string, Promise<void>>();

  const publish = () => {
    on.verdicts(new Map([...stored, ...edits]));
  };

  db.collection(VERDICTS).onSnapshot((snap) => {
    stored.clear();
    for (const doc of snap.docs) {
      const parsed = verdictSchema.safeParse(doc.data());
      if (parsed.success) stored.set(doc.id, parsed.data.text);
      else on.error(new Error(`verdict ${doc.id}: ${parsed.error.message}`));
    }
    publish();
  }, on.error);

  const write = (pieceId: string, text: string) => {
    const previous = writes.get(pieceId) ?? Promise.resolve();
    const next = previous
      .then(async () => db.doc(`${VERDICTS}/${pieceId}`).set({ text }))
      .then(() => {
        if (edits.get(pieceId) === text) edits.delete(pieceId);
        if (edits.size === 0) on.saveState("saved");
      })
      .catch(on.error);
    writes.set(pieceId, next);
  };

  return {
    edit(pieceId, text) {
      edits.set(pieceId, text);
      publish();
      on.saveState("saving");
      clearTimeout(timers.get(pieceId));
      timers.set(
        pieceId,
        setTimeout(() => {
          timers.delete(pieceId);
          if ((stored.get(pieceId) ?? "") === text) {
            edits.delete(pieceId);
            if (edits.size === 0) on.saveState("saved");
            return;
          }
          write(pieceId, text);
        }, SAVE_DELAY_MS),
      );
    },
  };
}

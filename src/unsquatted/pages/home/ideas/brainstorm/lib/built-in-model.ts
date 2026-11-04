import { parseIdeas } from './parse-ideas';
import { promptFor, RESPONSE_SCHEMA, SYSTEM_PROMPT } from './prompt';

const OPTIONS: LanguageModelCreateCoreOptions = {
  expectedInputs: [{ type: 'text', languages: ['en'] }],
  expectedOutputs: [{ type: 'text', languages: ['en'] }],
};

/**
 * Whether Chrome's built-in model can run here, downloaded or not. The global
 * is typed as always present, but only desktop Chrome defines it.
 */
export async function modelAvailability(): Promise<Availability> {
  if (!('LanguageModel' in globalThis)) return 'unavailable';

  return LanguageModel.availability(OPTIONS);
}

/** The page's one session, its system prompt already in; each prompt clones it. */
let session: Promise<LanguageModel> | undefined;

/**
 * The session, created on the first call. While the model is `downloadable`,
 * that call must come from a click — Chrome downloads the model then, and
 * `onProgress` hears the fraction done. A failed creation is forgotten, so
 * the next call tries again.
 */
export async function startModel(
  onProgress?: (fraction: number) => void,
): Promise<LanguageModel> {
  session ??= LanguageModel.create({
    ...OPTIONS,
    initialPrompts: [{ role: 'system', content: SYSTEM_PROMPT }],
    monitor: (monitor) => {
      monitor.addEventListener('downloadprogress', ({ loaded }) => {
        onProgress?.(loaded);
      });
    },
  }).catch((error: unknown) => {
    session = undefined;
    throw error;
  });

  return session;
}

/**
 * Variations of `label`, from a clone of the session, so no search's answer
 * colours the next one's.
 */
export async function suggest(
  label: string,
  signal: AbortSignal,
): Promise<string[]> {
  const fresh = await (await startModel()).clone({ signal });

  try {
    return parseIdeas(
      await fresh.prompt(promptFor(label), {
        responseConstraint: RESPONSE_SCHEMA,
        signal,
      }),
      label,
    );
  } finally {
    fresh.destroy();
  }
}

/** Ends the session; the model itself is Chrome's, which no page can delete. */
export async function endModel(): Promise<void> {
  const ending = session;

  session = undefined;
  (await ending)?.destroy();
}

import { useCallback, useSyncExternalStore } from 'react';

export type WithVolume = {
  /** The element's `volume`, 0 to 1. */
  volume: number;
};

/** The bar's settings a reader expects to find as they left them. */
export type SettingValues = WithVolume & {
  shuffle: boolean;
  remaining: boolean;
  /** The master rather than its MP3. */
  lossless: boolean;
};

type SettingName = keyof SettingValues;

/**
 * Where a setting starts for a reader who has never touched it, and how it is
 * written to storage and read back — `undefined` for a stored string it cannot
 * read, which the default then stands in for.
 */
type Codec<T> = {
  initial: T;
  parse: (stored: string) => T | undefined;
  format: (value: T) => string;
};

const FLAG_VALUES = new Map([
  ['on', true],
  ['off', false],
]);

function flag(initial: boolean): Codec<boolean> {
  return {
    initial,
    parse: (stored) => FLAG_VALUES.get(stored),
    format: (value) => (value ? 'on' : 'off'),
  };
}

function level(initial: number): Codec<number> {
  return {
    initial,
    parse: (stored) => {
      const value = Number(stored);

      return stored !== '' && value >= 0 && value <= 1 ? value : undefined;
    },
    format: String,
  };
}

const SETTINGS: { [N in SettingName]: Codec<SettingValues[N]> } = {
  shuffle: flag(false),
  remaining: flag(false),
  lossless: flag(false),
  volume: level(1),
};

const KEY_PREFIX = 'music.player.';

/**
 * Memory is the setting's truth and `localStorage` only its copy, so a browser
 * that refuses storage — a private window, blocked site data — still gets
 * working controls, just ones that reset on reload.
 */
const values: Partial<SettingValues> = {};
const listeners = new Set<() => void>();

/** What a stored string means for a setting, `null` being none stored. */
export function parseSetting<N extends SettingName>(
  name: N,
  stored: string | null,
): SettingValues[N] {
  const { initial, parse } = SETTINGS[name];

  return (stored === null ? undefined : parse(stored)) ?? initial;
}

function load<N extends SettingName>(name: N): SettingValues[N] {
  try {
    return parseSetting(name, localStorage.getItem(KEY_PREFIX + name));
  } catch {
    return SETTINGS[name].initial;
  }
}

function read<N extends SettingName>(name: N): SettingValues[N] {
  const known = values[name];

  if (known !== undefined) return known;

  const loaded = load(name);

  values[name] = loaded;

  return loaded;
}

function write<N extends SettingName>(name: N, value: SettingValues[N]) {
  values[name] = value;

  try {
    localStorage.setItem(KEY_PREFIX + name, SETTINGS[name].format(value));
  } catch {
    // Storage refused: the setting still holds in memory for this visit.
  }

  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * A setting of the bar's, remembered per browser. The static HTML is rendered
 * with every setting at its default, and hydration starts from that same value
 * before React re-renders with the stored one, so a remembered setting never
 * costs a hydration mismatch.
 */
export function useStoredSetting<N extends SettingName>(name: N) {
  const value = useSyncExternalStore(
    subscribe,
    () => read(name),
    () => SETTINGS[name].initial,
  );

  // Stable, so a memo that closes over it is not rebuilt on every render.
  const set = useCallback(
    (next: SettingValues[N]) => {
      write(name, next);
    },
    [name],
  );

  return [value, set] as const;
}

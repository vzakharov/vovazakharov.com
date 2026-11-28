import type { CanDispose } from '@/kernel/shared/typings';

const CONSOLE_NAME = 'cube';

/** The page's `cube` object, made when its first members arrive. */
function consoleObject(): object {
  const found: unknown = Reflect.get(globalThis, CONSOLE_NAME);
  if (typeof found === 'object' && found !== null) return found;
  const made = {};
  Reflect.set(globalThis, CONSOLE_NAME, made);
  return made;
}

/**
 * Adds `members` to the page's `cube` object, typed in the browser's console
 * as `cube.<member>`, until disposed. Several parts of the page each add
 * their own; disposing takes back only those still the ones added, and the
 * object itself once it is empty.
 */
export function installConsole(members: Record<string, unknown>): CanDispose {
  const target = consoleObject();
  Object.assign(target, members);
  return {
    dispose: () => {
      for (const [name, member] of Object.entries(members)) {
        if (Reflect.get(target, name) === member) {
          Reflect.deleteProperty(target, name);
        }
      }
      if (
        Object.keys(target).length === 0 &&
        Reflect.get(globalThis, CONSOLE_NAME) === target
      ) {
        Reflect.deleteProperty(globalThis, CONSOLE_NAME);
      }
    },
  };
}

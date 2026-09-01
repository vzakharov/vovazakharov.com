/** Joins class names, dropping the ones a conditional left out. */
export function cx(...names: (string | false | undefined)[]) {
  return names.filter(Boolean).join(' ');
}

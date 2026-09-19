// Reading `--name value` and `--name` off `process.argv`, for the scripts that
// take one. A bare `process.argv.includes('--check')` needs none of this and
// stays where it is; what earns a shared home is the value form, whose index
// arithmetic is the same mistake to make twice.

export const flag = (name: string): string | undefined => {
  const at = process.argv.indexOf(`--${name}`);
  return at === -1 ? undefined : process.argv[at + 1];
};

export const given = (name: string): boolean =>
  process.argv.includes(`--${name}`);

/**
 * The `git check-attr` arguments that read, from the `.gitattributes` committed
 * at HEAD, which of the NUL-separated paths on stdin are `linguist-generated`:
 * files a script writes from another file in the tree, which GitHub collapses
 * in a pull request and the board leaves off, their source and the script
 * being what a reviewer reads.
 */
export const CHECK_GENERATED = [
  "check-attr",
  "--source=HEAD",
  "-z",
  "--stdin",
  "linguist-generated",
];

/** The paths `CHECK_GENERATED`'s output marks set or true. */
export function generatedPaths(output: string): Set<string> {
  const fields = output.split("\0");
  const generated = new Set<string>();
  for (let i = 0; i + 2 < fields.length; i += 3) {
    const [path, , value] = fields.slice(i, i + 3);
    if (path !== undefined && (value === "set" || value === "true")) {
      generated.add(path);
    }
  }
  return generated;
}

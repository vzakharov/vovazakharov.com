const IMAGE_TYPES: ReadonlyMap<string, string> = new Map([
  ["png", "image/png"],
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["webp", "image/webp"],
]);

/** Above this an embedded image still ships, but the build says it is heavy. */
export const IMAGE_WARN_BYTES = 1_500_000;

/** The media type of an image the board shows, by the path's extension; null for any other file. */
export function imageType(path: string): string | null {
  const dot = path.lastIndexOf(".");
  if (dot < 0) return null;
  return IMAGE_TYPES.get(path.slice(dot + 1).toLowerCase()) ?? null;
}

/** The bytes as a `data:` URI, which the page shows without fetching anything. */
export const dataUri = (type: string, bytes: Uint8Array): string =>
  `data:${type};base64,${Buffer.from(bytes).toString("base64")}`;

/** One line per embedded image over {@link IMAGE_WARN_BYTES}, for the build to print. */
export function oversizeWarnings(sizes: ReadonlyMap<string, number>): string[] {
  return [...sizes]
    .filter(([, size]) => size > IMAGE_WARN_BYTES)
    .map(
      ([path, size]) =>
        `warning: ${path} is ${(size / 1_000_000).toFixed(2)} MB; it is embedded in the page, which is limited to 16 MB`,
    );
}

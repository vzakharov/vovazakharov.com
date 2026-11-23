const IMAGE_TYPES: ReadonlyMap<string, string> = new Map([
  ["png", "image/png"],
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["webp", "image/webp"],
]);

/** Where the page's images are published, relative to the page. */
export const IMAGE_DIR = "images";

/** The largest file an artifact publishes beside its page. */
export const IMAGE_LIMIT_BYTES = 15 * 1024 * 1024;

/** Hex digits of the blob id an image's published name keeps. */
const NAME_DIGITS = 16;

/** The media type of an image the board shows, by the path's extension; null for any other file. */
export function imageType(path: string): string | null {
  const dot = path.lastIndexOf(".");
  if (dot < 0) return null;
  return IMAGE_TYPES.get(path.slice(dot + 1).toLowerCase()) ?? null;
}

/**
 * Where the image blob `id` of media `type` is published, relative to the
 * page: named by its content, so a name already published holds these bytes.
 */
export const imagePath = (id: string, type: string): string =>
  `${IMAGE_DIR}/${id.slice(0, NAME_DIGITS)}.${type.slice(type.indexOf("/") + 1)}`;

/** One line per image over {@link IMAGE_LIMIT_BYTES}, which the publish refuses. */
export function oversizeImages(sizes: ReadonlyMap<string, number>): string[] {
  return [...sizes]
    .filter(([, size]) => size > IMAGE_LIMIT_BYTES)
    .map(
      ([path, size]) =>
        `${path} is ${(size / 1024 / 1024).toFixed(2)} MB, over the ${IMAGE_LIMIT_BYTES / 1024 / 1024} MB an artifact publishes a file at`,
    );
}

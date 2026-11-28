import { DATA_ID, ROOT_ID } from "#src/blind-test/shared/lib/page-ids.ts";

const FONTS =
  "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;600&display=swap";

/** JSON for a `<script type="application/json">` body: `<` is escaped so no `</script` or `<!--` can occur. */
export function escapeJson(value: unknown): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function escapeText(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export interface PageParts {
  title: string;
  data: unknown;
  js: string;
  css: string;
}

export interface Page {
  /** The page content the Artifact tool publishes; it adds the document skeleton. */
  fragment: string;
  /** The same content as a complete document, for opening off disk. */
  document: string;
}

export function renderPage({ title, data, js, css }: PageParts): Page {
  const head = [
    `<title>${escapeText(title)}</title>`,
    '<meta name="claude:viewport-fit-sides" content="cover">',
    `<link rel="stylesheet" href="${FONTS}">`,
    `<style>${css}</style>`,
  ].join("\n");
  const body = [
    `<main id="${ROOT_ID}"></main>`,
    `<script type="application/json" id="${DATA_ID}">${escapeJson(data)}</script>`,
    `<script>${js.replaceAll("</script", "<\\/script")}</script>`,
  ].join("\n");
  return {
    fragment: `${head}\n${body}\n`,
    document: [
      "<!doctype html>",
      '<html lang="ru">',
      '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
      head,
      "</head>",
      `<body>\n${body}\n</body>`,
      "</html>",
      "",
    ].join("\n"),
  };
}

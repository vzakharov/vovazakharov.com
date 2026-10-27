import { PUBLIC_DIR } from '@/kernel/shared/config/index.node-safe';
import type { WithFile } from '@/kernel/shared/typings';

import { listPrimaryDocuments } from '@/blog/shared/content';

import { CASES } from '@/basilisk/shared/content';
import { caseSealFile, caseSealSvg, SEAL_CUTS } from '@/basilisk/entities/case';

type SealContext = { params: Promise<WithFile> };

/** Every cut of every case's seal, by the file name it is served under. */
function sealFiles() {
  return new Map(
    listPrimaryDocuments(CASES).flatMap((document) =>
      SEAL_CUTS.map(
        (cut) => [caseSealFile(document.slug, cut), { document, cut }] as const,
      ),
    ),
  );
}

/**
 * The cases' seals, composed at build time and written by the export as
 * `/seals/<file>`: no copy of a seal is committed, so none can go stale.
 */
export function caseSealRoute() {
  return {
    generateStaticParams: (): WithFile[] =>
      [...sealFiles().keys()].map((file) => ({ file })),
    GET: async (_request: Request, { params }: SealContext) => {
      const { file } = await params;
      const seal = sealFiles().get(file);

      if (seal === undefined) throw new Error(`No case seal is ${file}.`);

      return new Response(caseSealSvg(PUBLIC_DIR, seal.document, seal.cut), {
        headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
      });
    },
  };
}

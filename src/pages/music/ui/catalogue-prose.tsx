import { type ProseSource, renderProse } from '@/shared/content';
import type { Labeled } from '@/shared/typings';

import { ProseContent } from '@/entities/document';

import { ReadMore } from './read-more';

type CatalogueProseProps = Labeled & { text: ProseSource };

/** A catalogue page's own text, folded behind `label` once it runs long. */
export async function CatalogueProse({ text, label }: CatalogueProseProps) {
  return (
    <ReadMore {...{ label }}>
      <ProseContent {...await renderProse(text)} />
    </ReadMore>
  );
}

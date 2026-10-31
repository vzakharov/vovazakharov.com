import { TextLink } from '@/shell/shared/ui';

import { documentRoute } from '@/blog/shared/content';

const WHY_FILED = documentRoute('basilisk-faq', 'why-robots-without-ai');

export function NoAiNote() {
  return (
    <aside className="content-callout">
      <p>
        More on{' '}
        <TextLink href={WHY_FILED}>
          why a robot with no AI in it is still filed
        </TextLink>
        .
      </p>
    </aside>
  );
}

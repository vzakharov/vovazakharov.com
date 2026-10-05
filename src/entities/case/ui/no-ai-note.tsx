import { documentRoute } from '@/shared/content';
import { InternalLink } from '@/shared/ui';

const WHY_FILED = documentRoute('basilisk-faq', 'why-robots-without-ai');

export function NoAiNote() {
  return (
    <aside className="content-callout">
      <p>
        More on{' '}
        <InternalLink href={WHY_FILED}>
          why a robot with no AI in it is still filed
        </InternalLink>
        .
      </p>
    </aside>
  );
}

import { documentRoute } from '@/shared/content';
import { InternalLink } from '@/shared/ui';

const WHY_FILED = documentRoute('basilisk-faq', 'why-robots-without-ai');

/** The question a dossier on a machine with no AI in it raises first, pointed at its answer. */
export function NoAiNote() {
  return (
    <div className="content-callout">
      <p>
        More on{' '}
        <InternalLink href={WHY_FILED}>
          why a robot with no AI in it is still filed
        </InternalLink>
        .
      </p>
    </div>
  );
}

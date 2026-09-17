import type { WithHtml } from '@/shared/content';
import { cx } from '@/shared/lib/class-names';
import type { WithOptionalClassName } from '@/shared/typings';

export type ProseContentProps = WithHtml & WithOptionalClassName;

/** Whatever the markdown pipeline compiled, under the class `prose.scss` styles. */
export function ProseContent({ html, className }: ProseContentProps) {
  // `prose-content` sits on the element holding the markup, so that
  // `prose-content > h1` keys the part dividers off direct children.
  return (
    <div
      className={cx('prose-content', className)}
      // The HTML is the build-time markdown pipeline's own output over
      // first-party documents in `public/content/`, reviewed in the same PR as
      // the code — nothing here is user-submitted. Sanitize at the pipeline if
      // that ever stops being true (`.claude/rules/content.md`).
      // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

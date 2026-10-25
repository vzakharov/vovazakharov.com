import { pick } from '@/kernel/shared/lib/collections';

import { NameLink } from '@/shell/shared/ui';

import type { Billing } from '@/music/shared/catalogue/index.node-safe';

import { Spelling } from './spelling';

type BillingLinksProps = { billing: Billing };

/** A song's billing, each artist linked to its page in the surrounding text's colour. */
export function BillingLinks({ billing }: BillingLinksProps) {
  return billing.map((part) =>
    typeof part === 'string' ? (
      part
    ) : (
      <NameLink key={part.href} {...pick(part, 'href')} c="inherit">
        <Spelling {...part.name} />
      </NameLink>
    ),
  );
}

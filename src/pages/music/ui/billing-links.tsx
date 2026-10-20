import { pick } from '@/shared/lib/collections';
import { NameLink } from '@/shared/ui';

import type { Billing } from '../lib/player-state';
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

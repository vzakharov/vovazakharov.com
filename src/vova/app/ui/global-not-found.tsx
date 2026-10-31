import { RootLayout } from '@/shell/app/ui';

import { NotFoundPage } from '@/vova/pages/not-found';

/**
 * The page a missed address gets. With a root layout per route group there is
 * none above them all for a `not-found.tsx` to render inside, so this one wraps
 * itself in shell's.
 */
export function GlobalNotFound() {
  return (
    <RootLayout>
      <NotFoundPage />
    </RootLayout>
  );
}

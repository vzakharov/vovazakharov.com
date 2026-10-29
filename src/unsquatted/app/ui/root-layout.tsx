import '../styles/site.scss';

import { Fraunces, Public_Sans } from 'next/font/google';

import type { WithChildren } from '@/kernel/shared/typings';

import { RootLayout as ShellRootLayout } from '@/shell/app/ui';

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  axes: ['opsz'],
});

const publicSans = Public_Sans({
  variable: '--font-public-sans',
  subsets: ['latin'],
});

/** shell's document, in the site's own faces and palette. */
export function RootLayout({ children }: WithChildren) {
  return (
    <ShellRootLayout fontVariables={[fraunces.variable, publicSans.variable]}>
      {children}
    </ShellRootLayout>
  );
}

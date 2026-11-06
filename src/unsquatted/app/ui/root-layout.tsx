import '../styles/site.scss';

import { Caveat, Fraunces, Public_Sans } from 'next/font/google';

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

// The hand a taken name's share card is corrected in. Only the canvas draws
// it, so nothing preloads it: the card fetches it when it first needs it.
const caveat = Caveat({
  variable: '--font-caveat',
  subsets: ['latin'],
  weight: '700',
  preload: false,
});

/** shell's document, in the site's own faces and palette. */
export function RootLayout({ children }: WithChildren) {
  return (
    <ShellRootLayout
      fontVariables={[fraunces.variable, publicSans.variable, caveat.variable]}
    >
      {children}
    </ShellRootLayout>
  );
}

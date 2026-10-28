import '../styles/site.scss';

import type { ComponentProps } from 'react';

import { RootLayout as ShellRootLayout } from '@/shell/app/ui';

/** shell's document, on her paper, in her ink and in her face. */
export function RootLayout(props: ComponentProps<typeof ShellRootLayout>) {
  return <ShellRootLayout {...props} />;
}

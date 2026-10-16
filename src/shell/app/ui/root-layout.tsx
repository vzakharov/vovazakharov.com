import { RootLayout as KernelRootLayout } from '@/kernel/app/ui';

import { ThemeCorner } from './theme-corner';

export function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <KernelRootLayout>
      <ThemeCorner />
      {children}
    </KernelRootLayout>
  );
}

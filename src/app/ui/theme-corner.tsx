import { getTranslations } from 'next-intl/server';

import { ThemeToggle } from '@/features/switch-theme';

import classes from './theme-corner.module.scss';

/**
 * The theme toggle's one home — `RootLayout` renders it for every page, so a
 * page renders nothing for it. It sits out of the flow in the top-right
 * corner, which a page's own first line has to clear.
 *
 * It is also the site shell's whole boundary with next-intl: translating here
 * rather than inside the toggle is what keeps the library's client runtime off
 * every page that isn't the CV.
 */
export async function ThemeCorner() {
  const t = await getTranslations('ui');

  return (
    <div className={classes['corner']}>
      <ThemeToggle label={t('toggleTheme')} />
    </div>
  );
}

import { getTranslations } from 'next-intl/server';

import { ThemeToggle } from '@/features/switch-theme';

import classes from './theme-corner.module.scss';

/**
 * The theme toggle's one home — `RootLayout` renders it for every page, so a
 * page renders nothing for it. It sits out of the flow in the top-right
 * corner, which a page's own first line has to clear.
 *
 * Async because it translates the toggle's label, which the toggle itself must
 * not do — `ThemeToggle`'s own docstring says why.
 */
export async function ThemeCorner() {
  const t = await getTranslations('ui');

  return (
    <div className={classes['corner']}>
      <ThemeToggle label={t('toggleTheme')} />
    </div>
  );
}

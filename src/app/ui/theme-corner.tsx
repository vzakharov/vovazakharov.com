import { ThemeToggle } from '@/features/switch-theme';

import classes from './theme-corner.module.scss';

/**
 * The theme toggle's one home, rendered by `RootLayout` for every page. It is
 * out of the flow and anchored to the page rather than the viewport, so it
 * costs no vertical band and scrolls away with the top of the document —
 * which is why a page's own first line has to clear the top-right corner.
 */
export function ThemeCorner() {
  return (
    <div className={classes['corner']}>
      <ThemeToggle />
    </div>
  );
}

import classes from './hover-dim.module.scss';

/**
 * The site's hover dim, as a class name a caller passes on. Slices that may not
 * reach each other sideways both claim it, and it is handed out from here so
 * that costs no global class.
 */
export const hoverDim = classes['hoverDim'];

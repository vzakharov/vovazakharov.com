import 'server-only';

/**
 * A static export renders once per deploy, so a copyright year is the build's.
 * Shared so the page footer and the printed one cannot disagree.
 *
 * Fenced because the module would otherwise run twice — once at build and again
 * at hydration — and print the build's year in the prerendered HTML and the
 * reader's own from next January onward.
 */
export const BUILD_YEAR = new Date().getFullYear();

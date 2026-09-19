import 'server-only';

/**
 * A static export renders once per deploy, so a copyright year is the build's,
 * and one constant keeps the page footer and the printed one from disagreeing.
 *
 * Fenced because the module otherwise runs again at hydration, printing the
 * build's year in the prerendered HTML and the reader's own from next January.
 */
export const BUILD_YEAR = new Date().getFullYear();

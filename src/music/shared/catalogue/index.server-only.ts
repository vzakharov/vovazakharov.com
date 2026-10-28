/**
 * What reads the catalogue's directory, which no browser may hold. A script
 * takes it here because `index.ts` resolves the site on import, and a script
 * may run with none.
 */

export { readCatalogueNames } from './catalogue-names';

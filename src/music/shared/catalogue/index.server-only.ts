/**
 * What reads the catalogue's directory, which no browser may hold. Its module
 * carries no `server-only`, since a script reaches it with no site resolved and
 * no `react-server` condition, where `index.ts` needs both.
 */

export { readCatalogueNames } from './catalogue-names';

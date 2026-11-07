export { ledeParts, plainByline, type WithCopy } from './config/i18n';
/**
 * The page's copy. The site is English-only, so there is one catalogue and no
 * locale to pick it by; a second language would turn this into kernel's
 * `catalogue`.
 */
export { default as COPY } from './config/messages/en.json';
export {
  type CopiedPrices,
  type Price,
  priceParts,
  type Prices,
  type WithPrice,
  type WithPrices,
} from './lib/price';
export {
  asTyped,
  cleanLabel,
  host,
  labelOf,
  type Row,
  rowsFor,
  typedZone,
  type WithDomain,
  zoneOf,
} from './lib/rows';
export { useWords } from './lib/use-words';
export {
  CheckerProvider,
  type TypedName,
  useChecker,
  type Zoned,
} from './ui/checker-state';

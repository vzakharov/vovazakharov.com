export { COPY, plainByline, type WithCopy } from './config/i18n';
export {
  type CopiedPrices,
  type Price,
  priceParts,
  type Prices,
  type WithPrice,
  type WithPrices,
} from './lib/price';
export {
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
} from './ui/checker-state';

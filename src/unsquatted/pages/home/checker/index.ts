export { COPY, type WithCopy } from './config/i18n';
export {
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
  ZONES,
} from './lib/rows';
export {
  CheckerProvider,
  type TypedName,
  useChecker,
} from './ui/checker-state';

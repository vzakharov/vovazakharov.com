// Address -> document header, in plain integer code: the type, number and date
// are never the model's, so a 1628 tax write-off is guaranteed rather than hoped for.
import { draw } from './core.mjs';

const TYPES = [
  ['TAX WRITE-OFF REPORT', 'Taxpayer:'],
  ['COPYRIGHT INFRINGEMENT CLAIM', 'Claimant:'],
  ['PERSONNEL FILE', 'Surname:'],
  ['MEMORANDUM', 'To:'],
  ['ACT OF WRITE-OFF of inventory items unfit for further use', 'The commission, consisting of:\n1.'],
  ['MINUTES OF THE MEETING of the Committee on Archival Storage', 'Present:'],
  ['CUSTOMS DECLARATION', 'Declarant:'],
  ['NOTICE OF EVICTION', 'To the tenant:'],
  ['POWER OF ATTORNEY', 'I, the undersigned,'],
  ['INSURANCE CLAIM', 'Policy holder:'],
  ['AUDIT REPORT', 'Auditor:'],
  ['LAND SURVEY CERTIFICATE', 'Owner of the plot:'],
  ['PATENT APPLICATION', 'Inventor:'],
  ['TRAVEL EXPENSE REPORT', 'Employee:'],
  ['LETTER OF COMPLAINT', 'Dear Sir,\n\n'],
  ['RECEIPT', 'Received from'],
];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Integer in [0, n) from the address and a salt; salts stay clear of the token indices. */
const pickN = (addr, salt, n) => draw(addr, 1_000_000 + salt) % n;

function year(addr) {
  // Spread across history: a bucket by weight, then a year inside it.
  const BUCKETS = [[-3000, 0, 15], [1, 1500, 25], [1500, 2000, 40], [2000, 2400, 20]];
  let r = pickN(addr, 3, 100);
  const [lo, hi] = BUCKETS.find(([, , w]) => (r -= w) < 0);
  const y = lo + pickN(addr, 6, hi - lo + 1);
  return y === 0 ? 1 : y;
}

const era = (y) => (y <= 0 ? `${1 - y} BC` : y < 1000 ? `AD ${y}` : `${y}`);

/** "26/12/3/41/1" (floor/room/shelf/folder/page) -> the header the model continues. */
export function header(addr) {
  const [floor, room, shelf, folder, page] = addr.split('/');
  const [title, opener] = TYPES[pickN(addr, 1, TYPES.length)];
  const no = 1 + pickN(addr, 2, 999);
  const y = year(addr);
  const d = `${1 + pickN(addr, 4, 28)} ${MONTHS[pickN(addr, 5, 12)]} ${era(y)}`;
  return `Floor ${floor}, room ${room}, shelf ${shelf}, folder ${folder}, page ${page}\n\n${title}\nNo. ${no}\nDate: ${d}\n\n${opener}`;
}

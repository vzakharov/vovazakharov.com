import Image from 'next/image';

import type { Slugged } from '@/blog/shared/content';

import { caseSealPath } from '../lib/case-seal';
import classes from './case.module.scss';

/** The seal's intrinsic side; the stylesheet sets the size it shows at. */
const SEAL_SIZE = 176;

/**
 * The case's lettered seal, set in the article header. Its `alt` is empty,
 * since it pictures what the title says.
 */
export function CaseSeal({ slug }: Slugged) {
  return (
    <Image
      src={caseSealPath(slug, 'lettered')}
      alt=""
      aria-hidden
      width={SEAL_SIZE}
      height={SEAL_SIZE}
      className={classes['seal']}
    />
  );
}

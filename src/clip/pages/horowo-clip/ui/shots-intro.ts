import type { Shot } from '@/clip/shared/timeline';
import { kidsShow } from '@/clip/widgets/kids-show';

import { sectionNamed } from './stand-in';

const intro = sectionNamed('intro');
const { to: bandEntry } = intro;

// «Как, сука, хорошо»: the jaw drops on «Как», and the set falls into static
// from the end of «хорошо» to the band's entry.
const JAW_DROP = 16.12;
const FALL_FROM = 17.88;

/** The intro: a children's show, jolting on each bar's first beat. */
export const INTRO_SHOTS: readonly Shot[] = [
  {
    ...intro,
    draw: kidsShow({
      jawDrop: JAW_DROP,
      fall: { from: FALL_FROM, to: bandEntry },
    }),
  },
];

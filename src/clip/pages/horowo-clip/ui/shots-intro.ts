import type { Shot } from '@/clip/shared/timeline';
import { closeUp } from '@/clip/widgets/close-up';

import { sectionNamed } from './stand-in';

const intro = sectionNamed('intro');
const { to: bandEntry } = intro;

// «Как, сука, хорошо»: the jaw drops on «Как», and the camera falls into the
// mouth from the end of «хорошо» to the band's entry.
const JAW_DROP = 16.12;
const FALL_FROM = 17.88;

/** The intro: the singer's face on black, emblems landing on each bar's hit. */
export const INTRO_SHOTS: readonly Shot[] = [
  {
    ...intro,
    draw: closeUp({
      jawDrop: JAW_DROP,
      fall: { from: FALL_FROM, to: bandEntry },
    }),
  },
];

import { songAudio } from '@/clip/shared/score/index.server-only';

import { ClipStage } from './clip-stage';

/** «Хорошо!», drawn in code and played against the song. */
export function HorowoClipPage() {
  return <ClipStage audio={songAudio()} />;
}

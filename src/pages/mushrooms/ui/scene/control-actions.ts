import { pick } from '@/shared/lib/collections';

import type { Arrivals } from './arrivals';
import type { ControlHandlers } from './controls';
import type { Planter, Scened } from './planter';
import type { MeadowSound } from './sound';

/**
 * What the buttons act through: the scene's voice and reducer, the repaint
 * of the controls themselves, and the arrivals and the planter, whose own
 * handlers the buttons call straight.
 */
export type ControlScene = Pick<Scened, 'dispatch'> & {
  voice: MeadowSound;
  repaint: () => void;
  arrivals: Pick<Arrivals, 'grow' | 'roomy' | 'release'>;
  planter: Pick<Planter, 'colour' | 'plant' | 'plantable'>;
};

/** What each button over the meadow does, through `scene`. */
export function controlActions(scene: ControlScene): ControlHandlers {
  const { voice, dispatch, repaint, arrivals, planter } = scene;
  return {
    mute: () => {
      voice.toggleMuted();
      voice.pop();
      dispatch({ kind: 'shut' });
      repaint();
    },
    pick: () => {
      voice.pop();
      dispatch({ kind: 'pick' });
    },
    remove: () => {
      dispatch({ kind: 'remove' });
    },
    house: () => {
      voice.pop();
      dispatch({ kind: 'house' });
    },
    furnish: (piece) => {
      dispatch({ kind: 'furnish', piece });
    },
    ...pick(arrivals, 'grow', 'roomy', 'release'),
    ...pick(planter, 'colour', 'plant', 'plantable'),
    pull: () => {
      voice.pop();
      dispatch({ kind: 'pull' });
    },
    refuse: () => {
      voice.nuhUh();
    },
  };
}

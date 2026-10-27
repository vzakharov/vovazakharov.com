import { pick } from '@/kernel/shared/lib/collections';

import type { Dispatching } from '@/mushrooms/shared/world';
import type { Repainting } from '@/mushrooms/entities/mushroom/index.node-safe';
import type { GaitFlipping } from '@/mushrooms/features/walk-meadow/index.node-safe';
import type { Flippable } from '@/mushrooms/widgets/map';

import type { Action } from '../model/game';
import type { Summoning } from './arrivals';
import type { ControlHandlers } from './controls';
import type { PickerPlanting } from './planter';
import type { MeadowSound } from './sound';

/**
 * What the buttons act through: the scene's voice and reducer, the repaint
 * of the controls themselves, the map's switch, the eye's gait, and the
 * arrivals and the planter, whose own handlers the buttons call straight.
 */
export type ControlScene = Dispatching<Action> &
  Repainting & {
    voice: MeadowSound;
    map: Flippable;
    eye: GaitFlipping;
    arrivals: Summoning;
    planter: PickerPlanting;
  };

/** What each button over the meadow does, through `scene`. */
export function controlActions(scene: ControlScene): ControlHandlers {
  const { voice, dispatch, repaint, map, eye, arrivals, planter } = scene;
  return {
    map: () => {
      map.flip();
      voice.pop();
      dispatch({ kind: 'map' });
      repaint();
    },
    gait: () => {
      eye.flipGait();
      voice.pop();
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

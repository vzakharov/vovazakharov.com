import {
  beckon,
  breath,
  emerge,
  sink,
  widthFor,
  wobble,
} from '../../model/motion';
import { sproutScale } from '../../model/sprouting';
import type { Lights } from './dusk-view';
import type { Shown } from './mushroom-shown';

/** A tapped mushroom's rock to and fro, against its squash. */
const WOBBLE_ROCK = 0.35;
/** How much wider a shadow spreads per unit of the mushroom's squash. */
const SHADOW_SPREAD = 0.6;
/**
 * How much larger a mushroom is drawn in a wet meadow, scaled about its foot.
 * Its hit area, in its drawing's frame, grows with it; the outline read off
 * its genes (`mushroom-outline`) does not, the 6 % being inside the tap
 * patch's slack.
 */
const RAIN_SWELL = 0.06;

/**
 * Breathes, wobbles and grows `shown` at `t`, in seconds, swollen about its
 * foot by the meadow's `wetness`, 0 to 1 (`RAIN_SWELL`), its house following
 * its drawing with the windows lit as `lights` has the dusk, and its shadow
 * spreading as it squashes.
 */
export function moveMushroom(
  shown: Shown,
  t: number,
  wetness: number,
  lights?: Lights,
): void {
  const {
    graphics,
    shadow,
    house,
    plantedAt,
    goneAt,
    tappedAt,
    phase,
    turn,
    sprout,
    stands: { zoom, drawn },
  } = shown;
  const young = sproutScale(sprout, t * 1000);
  const swell = 1 + RAIN_SWELL * wetness;
  const grown =
    Math.min(emerge(t - plantedAt), sink(t - goneAt)) * swell * young;
  const bounce = wobble(t - tappedAt);
  const stretch = breath(t, phase) + bounce + beckon(t, shown);
  graphics
    .setScale(widthFor(stretch) * grown * zoom, (1 + stretch) * grown * zoom)
    .setRotation(turn + bounce * WOBBLE_ROCK)
    .setVisible(drawn);
  house.update(t, shown, lights);
  shadow
    .setScale(
      (1 + Math.max(0, -stretch) * SHADOW_SPREAD) * grown * zoom,
      grown * zoom,
    )
    .setVisible(drawn);
}

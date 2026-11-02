import type { Plot } from '@/mushrooms/entities/flower/index.node-safe';
import type {
  InsectKind,
  Origin,
  Perch,
  Placed,
  ShelterSeat,
} from '@/mushrooms/entities/insect/index.node-safe';

/**
 * What the scene sees of the perches, which only the screen can say, and
 * where a bee could plant a flower (`Plot`).
 */
export type Sight = Plot &
  FlowersSeen &
  Placed &
  Sheltered & {
    /** The spots in the open air, by id, an insect with nowhere to sit roams between. */
    air: readonly string[];
  };

/** The flowers in sight. */
export type Flowered = {
  /** The flowers in sight, by id: the only ones an insect is sent to. */
  flowers: readonly string[];
  /** The more of them a bee's narrower wings see (`flowersFor`). */
  beeFlowers?: readonly string[];
};

/** A perch crowded by a taken one counts as taken. */
type Crowded = { crowded: readonly Crowding[] };

/** The flowers in sight, and the perches crowded by taken ones. */
export type FlowersSeen = Flowered & Crowded;

/** The seats under the caps in sight, offered only while it rains (`shelteredPerches`). */
export type Sheltered = { shelters?: readonly ShelterSeat[] };

/** While it rains: no flower or cap top is offered, and a flier takes the nearest shelter. */
export type Raining = { raining?: boolean };

/**
 * The perches the meadow offers: every standing mushroom's cap, the spotted
 * ones among them by id again, and what the scene sees.
 */
export type Perches = Sight &
  Raining & {
    caps: readonly string[];
    spotted: readonly string[];
    /** Past half way to dusk: a flier seeks its `roost` first and never roams by choice (`roostedPerches`). */
    dusky?: boolean;
  };

/**
 * Two kinds of insect, the first on the first perch of a `Crowding` and the
 * second on the second.
 */
export type Pairing = readonly [InsectKind, InsectKind];

/**
 * Two perches standing too close for an insect on each, and for which kinds
 * on them: the wider two insects' wings, the farther apart they must sit.
 */
export type Crowding = readonly [Perch, Perch, readonly Pairing[]];

/** Where a choice sets off from, the perches offered, and the ones it cannot take. */
export type Hemmed = Origin & {
  perches: Perches;
  blocked: ReadonlySet<string>;
};

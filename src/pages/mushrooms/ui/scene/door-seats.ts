import type { Planted } from '../../model/game';
import type { Eye } from '../../model/ground';
import type { DoorPlace } from '../../model/house';
import {
  anchoredGround,
  laidOf,
  type MushroomGround,
  placeIn,
} from './clump-layout';
import { doorInSight, type Standing, standingAt } from './door-sight';

/**
 * Where the door of each of `mushrooms` that `due` picks is seated, by id:
 * where the ones in front of it leave it in sight (`doorInSight`), as
 * `ground` stands them, or, for one whose foot lies outside that world — grown
 * where the child walked or turned to — as `ground` anchored at `eye` stands
 * them. One neither places is laid out alone (`laidOf`) with none in front of
 * it, so every grown mushroom has a seat for its door the moment one goes in.
 */
export function doorSeats<T extends Planted>(
  ground: MushroomGround,
  eye: Eye,
  mushrooms: readonly T[],
  due: (mushroom: T) => boolean,
): Map<string, DoorPlace> {
  const grounds = [ground, anchoredGround(ground, eye)];
  // Each ground's standings, so a mushroom is seated among those of its own ground.
  const among = grounds.map((each) =>
    mushrooms.flatMap((mushroom): Standing[] => {
      const place = placeIn(each, mushroom);
      return place ? [standingAt(place, mushroom)] : [];
    }),
  );
  return new Map(
    mushrooms
      .filter((mushroom) => due(mushroom))
      .map((mushroom) => {
        for (const [index, each] of grounds.entries()) {
          const place = placeIn(each, mushroom);
          if (place) {
            const seat = doorInSight(
              standingAt(place, mushroom),
              among[index] ?? [],
            );
            return [mushroom.id, seat];
          }
        }
        const alone = standingAt(laidOf(ground.camera, mushroom), mushroom);
        return [mushroom.id, doorInSight(alone, [])];
      }),
  );
}

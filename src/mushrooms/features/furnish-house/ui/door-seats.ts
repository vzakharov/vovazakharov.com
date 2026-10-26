import {
  anchoredGround,
  type Eye,
  type MushroomGround,
} from '@/mushrooms/shared/world';
import {
  doorInSight,
  type DoorPlace,
  laidOf,
  placeIn,
  type Planted,
  type Standing,
  standingAt,
} from '@/mushrooms/entities/mushroom/index.node-safe';

/**
 * Where the door of each of `mushrooms` that `due` picks is seated, by id:
 * where the ones in front of it leave it in sight (`doorInSight`), as the
 * child at `eye` sees them on `ground`. One that eye does not see — the
 * newest with room, or one still selected, standing behind or beside the
 * child — is laid out alone (`laidOf`) with none in front of it, so every
 * grown mushroom has a seat for its door the moment one goes in.
 */
export function doorSeats<T extends Planted>(
  ground: MushroomGround,
  eye: Eye,
  mushrooms: readonly T[],
  due: (mushroom: T) => boolean,
): Map<string, DoorPlace> {
  const seen = anchoredGround(ground, eye);
  const among = mushrooms.flatMap((mushroom): Standing[] => {
    const place = placeIn(seen, mushroom);
    return place ? [standingAt(place, mushroom)] : [];
  });
  return new Map(
    mushrooms
      .filter((mushroom) => due(mushroom))
      .map((mushroom) => {
        const place = placeIn(seen, mushroom);
        return place
          ? [mushroom.id, doorInSight(standingAt(place, mushroom), among)]
          : [
              mushroom.id,
              doorInSight(
                standingAt(laidOf(ground.camera, mushroom), mushroom),
                [],
              ),
            ];
      }),
  );
}

/** Something heard at a level: 0 is silence, 1 as loud as anything gets. */
export type Loud = { loudness: number };

/** What a floor is underfoot, which is how a step on it sounds. */
export const FOOTINGS = [
  'carpet',
  'tile',
  'concrete',
  'wood',
  'metal',
  'wet',
  'soft',
  'hollow',
] as const;
export type Footing = (typeof FOOTINGS)[number];

/** What the island is underfoot, from the dry beach to ankle-deep water. */
export const GROUNDS = ['sand', 'wet-sand', 'shallows'] as const;
export type Ground = (typeof GROUNDS)[number];

/** Anything a foot can come down on. */
export type Underfoot = Footing | Ground;

/** What the ladder to the doorway is made of, which is how a rung answers. */
export const LADDERS = ['aluminium', 'wood'] as const;
export type Ladder = (typeof LADDERS)[number];

/** The ladder's own material: an old weathered one, with round rungs. */
export const LADDER_MATERIAL: Ladder = 'wood';

/** What takes hold of a rung, or stands on it. */
export type Limb = 'hand' | 'foot';

/** What a room can be heard doing by itself, with nobody in it doing it. */
export const ROOM_CUES = [
  'ring',
  'knock',
  'thud',
  'steps',
  'creak',
  'rustle',
  'pop',
  'mew',
  'scrape',
] as const;
export type RoomCue = (typeof ROOM_CUES)[number];

/** How a floor sounds with nobody on it. */
export type Sound = {
  footing: Underfoot;
  /** The lamps' hum, in hertz; 0 where they make none. */
  hum: number;
  /** Moving air, 0 (still) to 1 (a duct beside the ear). */
  air: number;
  /** How long a clap rings, in seconds. */
  echo: number;
};

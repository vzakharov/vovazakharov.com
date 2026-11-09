import {
  fixed,
  formatPlace,
  type Place,
  PLACES,
  type Pose,
} from './place-hash';

/** What the where-line says: the build, the place, the hour and the tiles drawn. */
export type Where = {
  /** The build's commit. */
  readonly commit: string;
  /** The page's address before the hash. */
  readonly page: string;
  readonly place: Place;
  /** The sun's time of day under the eye, hours past its midnight. */
  readonly solarHours: number;
  /** Levels of the drawn tiles under the eye, and of every tile drawn. */
  readonly tiles: {
    readonly under: readonly number[];
    readonly drawn: readonly number[];
  };
};

const signed = (value: number, places: number) => {
  const text = fixed(value, places);
  return text.startsWith('-') ? text : `+${text}`;
};

const pad = (n: number) => String(n).padStart(2, '0');

const clock = (hours: number) => {
  const minutes = Math.round(hours * 60) % (24 * 60);
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
};

const levels = (list: readonly number[]) =>
  [...new Set(list)].toSorted((a, b) => a - b);

function tilesOf({ under, drawn }: Where['tiles']): string {
  if (drawn.length === 0) return 'tiles none drawn';
  const all = levels(drawn);
  const here = under.length === 0 ? '–' : levels(under).join('/');
  return `tiles ${here} (${String(all[0])}–${String(all.at(-1))})`;
}

const poseOf = (pose: Pose, solarHours: number) => [
  `lat ${fixed(pose.lat, PLACES.lat)}° lon ${fixed(pose.lon, PLACES.lon)}°`,
  `height ${fixed(pose.height, PLACES.height)} m`,
  `heading ${fixed(pose.heading, PLACES.heading)}°`,
  `pitch ${signed(pose.pitch, PLACES.pitch)}° (look)`,
  pose.hours === undefined
    ? `${clock(solarHours)} sun time`
    : `${clock(solarHours)} sun time (t ${fixed(pose.hours, PLACES.hours)} h)`,
];

/**
 * One line to reproduce a view from: the build, the link that reopens it, and
 * the same pose spelled for a person — the pitch being the look the eye holds
 * above the pitch its height gives, so labelled.
 */
export function whereLine({ commit, page, place, solarHours, tiles }: Where) {
  return [
    `island ${commit} ${page}${formatPlace(place)}`,
    `world ${place.world}`,
    ...(place.pose === undefined ? [] : poseOf(place.pose, solarHours)),
    tilesOf(tiles),
  ].join(' · ');
}

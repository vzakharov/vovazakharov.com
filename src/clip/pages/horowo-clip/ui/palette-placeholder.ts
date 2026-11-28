/** One wash per kind of stand-in shot, so a cut between two reads at a glance. */
export const WASHES = {
  broadcast: '#3c6e8f',
  channel: '#b2452f',
  reality: '#2b2a3a',
  live: '#7a3f8c',
  ward: '#4d5a3c',
  globe: '#2f5d63',
} as const;

export type Wash = keyof typeof WASHES;

/** The colours a stand-in card draws over its wash, and the player round the stage. */
export const PLACEHOLDER_PALETTE = {
  /** The flash on each beat and the lettering. */
  light: '#fff6dc',
  /** The ring round a card on an onset a cut lands on. */
  cue: '#ff3b2f',
  /** The jaw meter's fill. */
  mouth: '#c0392b',
  /** The scrub bar: its track and how much has played. */
  track: '#3a3640',
  played: '#e8d9a8',
} as const;

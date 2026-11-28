/** The TV studio's colours: its walls, its lights and each player's backdrop. */
export const GIG_PALETTE = {
  wall: '#24123a',
  floor: '#120a1c',
  stageEdge: '#f2c230',
  /** The swinging spotlights, in turn. */
  beams: ['#ff3fa4', '#36e0d0', '#ffe14a', '#8a5cff'],
  /** The marquee's lit and dark bulbs. */
  bulbOn: '#ffe9a0',
  bulbOff: '#4a2c3c',
  bulbEdge: '#000000',
  /** Each player's close-up backdrop. */
  backdrop: {
    guitar: '#c0186a',
    vocal: '#e0a414',
    bass: '#108a80',
    drums: '#d0461c',
  },
  /** Each player's backdrop in an extreme close-up: the same hue, near black, so fast cuts do not flash. */
  shadow: {
    guitar: '#3c0a24',
    vocal: '#3a2a08',
    bass: '#06302c',
    drums: '#3c1408',
  },
  /** The drummer's foot on the kick pedal. */
  boot: '#1c1820',
  sole: '#0b0a0e',
  lace: '#d9cfb8',
  trouser: '#2c2a33',
  felt: '#f3efe2',
  /** The kick drum's head and hoop, as the kit has them. */
  skin: '#f1ede0',
  hoop: '#2f5fb3',
  cross: '#d8382c',
} as const;

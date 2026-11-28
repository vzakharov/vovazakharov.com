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
} as const;

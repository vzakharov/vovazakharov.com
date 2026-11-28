/** The zapped channels' colours, one group per show. */
export const CHANNELS_PALETTE = {
  text: '#fff4c8',
  textShadow: '#120c18',
  shop: {
    wall: '#6a1a8a',
    stripe: '#8e2cb0',
    spoon: '#d8dce2',
    price: '#ffe030',
  },
  weather: {
    sea: '#1c4fa8',
    land: '#3e9a48',
    sun: '#ffd23a',
    cloud: '#e8ecf2',
  },
  quiz: {
    wall: '#0e1c6a',
    board: '#1a3ad0',
    tile: '#f2c230',
    tileDark: '#0a0a2a',
  },
  postcard: {
    sky: '#8ec8f0',
    field: '#d8b84a',
    hut: '#7a4a22',
    roof: '#9a2a1a',
    birch: '#f2f0e8',
    leaf: '#4aa83a',
  },
  news: {
    wall: '#123a5a',
    desk: '#5a1a1a',
    window: '#2a6aa0',
    ticker: '#c81a14',
  },
  aerobics: { wall: '#ff5fa8', floor: '#3ad0c0', stripe: '#ffe14a' },
  clock: { field: '#08102a', face: '#e8ecf0', hand: '#101018', dot: '#e8261c' },
} as const;

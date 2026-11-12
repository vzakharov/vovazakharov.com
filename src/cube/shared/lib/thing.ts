/**
 * Everything a room can be furnished with. A floor's theme names the things
 * it holds and how many; the decor builds each from a few boxes.
 */
export const THINGS = [
  // Offices.
  'desk',
  'office-chair',
  'filing-cabinet',
  'water-cooler',
  'copier',
  'whiteboard',
  'cubicle-screen',
  'bin',
  'server-rack',
  // Any building.
  'potted-plant',
  'wall-clock',
  'notice-board',
  'exit-sign',
  'vent',
  'door',
  'radiator',
  'socket',
  'fire-extinguisher',
  'cardboard-box',
  'bench',
  'locker',
  'vending-machine',
  'payphone',
  'wet-floor-sign',
  'traffic-cone',
  'ladder',
  'pipe',
  'mirror',
  'window',
  'curtain',
  // Homes.
  'sofa',
  'armchair',
  'floor-lamp',
  'tv',
  'bed',
  'mattress',
  'wardrobe',
  'bookshelf',
  'rug',
  // Places to wait, play or shop in.
  'shopping-cart',
  'arcade-cabinet',
  'chair-stack',
  'slide',
  'pool-ladder',
  'balloon',
  'mannequin',
  // Works and laboratories.
  'lab-bench',
  'tank',
  'barrel',
  'crate',
  'drain',
  'cable-reel',
  'monolith',
  'staircase',
] as const;
export type Thing = (typeof THINGS)[number];

/** One kind of thing a floor's rooms hold. */
export type Furnishing = {
  thing: Thing;
  /** How many of it a room holds on average: 0.2 is one room in five. */
  perRoom: number;
};

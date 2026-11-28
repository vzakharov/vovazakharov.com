// masd-disable insignificant -- wave 2's broadcast and reality scenes draw the bunny; until they land nothing under src/clip reads it.
export type { Audience, EarFlight, Seat } from './model/crowd';
export { earFlights, seats } from './model/crowd';
export type { Arms, BunnyLook, Eyes } from './model/pose';
export { ARMS, EYES, FEET_Y, lookAt } from './model/pose';
export { studioAudience } from './ui/audience';
export type { BunnyDrawing } from './ui/bunny';
export { bunny } from './ui/bunny';
export { BUNNY_PALETTE, WALLPAPER_PALETTE } from './ui/palette-bunny';
export type { Cell, Wallpaper } from './ui/wallpaper';
export { bunnyWallpaper } from './ui/wallpaper';

/** The master's length, in seconds. */
export const SONG_SECONDS = 119.7;

/**
 * How long the film runs before the song's first note — the photosensitivity
 * warning, then the channel's ident — in seconds. The score keeps song time,
 * which is negative through it.
 */
export const PREROLL = 13;

/**
 * How long the film runs on in silence after the master ends, in seconds:
 * song time passes `SONG_SECONDS` through it.
 */
export const POSTROLL = 5;

/** The film's time at song time `t`: the film opens on the ident. */
export const filmTime = (t: number): number => t + PREROLL;

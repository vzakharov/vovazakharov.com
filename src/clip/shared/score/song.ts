/** The master's length, in seconds. */
export const SONG_SECONDS = 119.7;

/**
 * How long the channel's ident runs before the song's first note, in
 * seconds. The score keeps song time, which is negative through it.
 */
export const PREROLL = 3.2;

/** The film's time at song time `t`: the film opens on the ident. */
export const filmTime = (t: number): number => t + PREROLL;

/** The song's time at film time `t`. */
export const songTime = (t: number): number => t - PREROLL;

/**
 * Onsets the picture cuts on, in seconds, measured from the master.
 *
 * The seven «(Хорошо!)» of the verse are backing shouts the transcript never
 * heard: each is a burst in the harmonic part of the vocal band (400–2500 Hz,
 * drums median-filtered out) ending just short of a downbeat, bars 13 to 19.
 */
export const VERSE_CALLS = [
  27.61, 29.61, 31.72, 33.65, 35.7, 37.81, 39.88,
] as const;

/**
 * Every «Хорошо» of the chant after the second «Как, сука, хорошо», the one
 * closing «Не сдохнуть бы, как хорошо» included: where three Whisper passes
 * (large-v3 twice, medium once) agreed, or where only one heard a word on a
 * downbeat the others missed.
 */
export const CHANT = [
  62.88, 64.88, 66.96, 69, 72.12, 73.2, 75.16, 76.84, 81.3, 85, 88.02,
] as const;

/** How long a verse call is shouted, in seconds: up to the downbeat. */
export const CALL_SECONDS = 0.36;

/** How long a chanted «Хорошо» is sung, in seconds. */
export const CHANT_SECONDS = 0.56;

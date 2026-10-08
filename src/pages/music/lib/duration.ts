/**
 * `m:ss`, as a track length is written everywhere, and `h:mm:ss` from an hour
 * up, which only an album's total reaches. Its own module because both the
 * track list and the player bar want it, and the bar is a client component that
 * must not reach the build-time modules beside it.
 */
export function formatDuration(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const rest = String(whole % 60).padStart(2, '0');

  return hours === 0
    ? `${minutes}:${rest}`
    : `${hours}:${String(minutes).padStart(2, '0')}:${rest}`;
}

/** A run of tracks' combined length, written as `formatDuration` writes one. */
export function totalDuration(seconds: readonly number[]): string {
  return formatDuration(seconds.reduce((sum, track) => sum + track, 0));
}

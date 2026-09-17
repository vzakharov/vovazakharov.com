/**
 * `m:ss`, as a track length is written everywhere. Its own module because both
 * the track list and the player bar want it, and the bar is a client component
 * that must not reach the build-time modules beside it.
 */
export function formatDuration(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));

  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

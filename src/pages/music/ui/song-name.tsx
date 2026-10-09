import type { SongName as SongNameProps } from '../lib/player-state';

/** A song's title as text, in italics where it is a romanization. */
export function SongName({ title, transliterated }: SongNameProps) {
  return transliterated ? <em>{title}</em> : title;
}

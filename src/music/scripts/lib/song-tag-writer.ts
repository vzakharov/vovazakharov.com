/**
 * Writes a `SongTags` into a song's file, replacing whatever it carried:
 * ID3v2.3 with UTF-16 text in an MP3 — the version Windows Explorer and older
 * car and phone players read, the encoding the lyrics need — and a Vorbis
 * comment plus a native picture block in a FLAC. Audio frames are left alone.
 */

import {
  File,
  type Id3v2FrameIdentifier,
  Id3v2FrameIdentifiers,
  Id3v2Settings,
  Id3v2Tag,
  Id3v2UrlLinkFrame,
  Picture,
  PictureType,
  StringType,
  type Tag,
  TagTypes,
  XiphComment,
} from 'node-taglib-sharp';

import { extensionOf } from '@/music/shared/catalogue/index.node-safe';

import type { SongTags } from './song-tags.ts';

Id3v2Settings.defaultVersion = 3;
Id3v2Settings.forceDefaultVersion = true;
Id3v2Settings.defaultEncoding = StringType.UTF16;
Id3v2Settings.forceDefaultEncoding = true;

/** The fields both containers name alike, through taglib's own mapping. */
function setCommon(tag: Tag, tags: SongTags): void {
  tag.title = tags.title;
  tag.performers = [tags.artist];
  tag.composers = tags.composers;
  tag.year = tags.year;
  if (tags.album !== undefined) tag.album = tags.album;
  if (tags.albumArtist !== undefined) tag.albumArtists = [tags.albumArtist];
  if (tags.track !== undefined) tag.track = tags.track;
  if (tags.trackTotal !== undefined) tag.trackCount = tags.trackTotal;
  if (tags.lyrics !== undefined) tag.lyrics = tags.lyrics;
}

/** taglib types its frame table as an open record, so a missing name throws here. */
function frame(name: string): Id3v2FrameIdentifier {
  const identifier = Id3v2FrameIdentifiers[name];

  if (identifier === undefined)
    throw new Error(`taglib knows no ${name} frame`);

  return identifier;
}

function frontCover(path: string): Picture {
  const picture = Picture.fromPath(path);

  picture.type = PictureType.FrontCover;

  return picture;
}

function writeId3(file: File, tags: SongTags, cover?: string): void {
  file.removeTags(TagTypes.AllTags);

  const tag = file.getTag(TagTypes.Id3v2, true);

  if (!(tag instanceof Id3v2Tag)) throw new Error('No ID3v2 tag to write');

  // The language `USLT` is filed under, which taglib reads off this static.
  Id3v2Tag.language = tags.language;
  setCommon(tag, tags);
  tag.setTextFrame(frame('TEXT'), ...tags.lyricists);
  tag.setTextFrame(frame('TLAN'), tags.language);

  const page = Id3v2UrlLinkFrame.fromIdentity(frame('WOAF'));

  page.text = [tags.url];
  tag.addFrame(page);
  if (cover !== undefined) tag.pictures = [frontCover(cover)];
}

function writeXiph(file: File, tags: SongTags, cover?: string): void {
  file.removeTags(TagTypes.AllTags);

  const comment = file.getTag(TagTypes.Xiph, true);

  if (!(comment instanceof XiphComment)) throw new Error('No Vorbis comment');

  setCommon(comment, tags);
  comment.setFieldAsStrings('LYRICIST', ...tags.lyricists);
  comment.setFieldAsStrings('LANGUAGE', tags.language);
  comment.setFieldAsStrings('CONTACT', tags.url);
  // The combined tag files a picture as FLAC's own block; set on the comment
  // as well, it would land twice.
  if (cover !== undefined) file.tag.pictures = [frontCover(cover)];
}

const WRITERS: Readonly<
  Record<string, (file: File, tags: SongTags, cover?: string) => void>
> = { mp3: writeId3, flac: writeXiph };

/** `cover` is a path on disk, the JPEG the song's page shows. */
export function writeSongTags(
  path: string,
  tags: SongTags,
  cover?: string,
): void {
  const write = WRITERS[extensionOf(path)];

  if (write === undefined) throw new Error(`No tag writer for ${path}`);

  const file = File.createFromPath(path);

  try {
    write(file, tags, cover);
    file.save();
  } finally {
    file.dispose();
  }
}

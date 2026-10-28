import { z } from 'zod';

/**
 * An album's slug and an artist's name, each a string the catalogue vouches
 * for — branded, so neither passes for the other. These check the form only;
 * `catalogue-names.ts` builds the schemas that also check the file exists.
 */

/** A page's address: lowercase ASCII, words joined by hyphens. */
export const SLUG = /^[\da-z]+(?:-[\da-z]+)*$/;

export const musicAlbumSchema = z.string().regex(SLUG).brand<'MusicAlbum'>();

export type MusicAlbum = z.infer<typeof musicAlbumSchema>;

export const musicProjectSchema = z.string().min(1).brand<'MusicProject'>();

export type MusicProject = z.infer<typeof musicProjectSchema>;

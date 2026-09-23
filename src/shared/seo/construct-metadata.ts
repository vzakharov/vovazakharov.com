import 'server-only';

import type { Metadata } from 'next';

import { getAbsoluteUrl, SITE_CONFIG } from '@/shared/config';
import type {
  BaseFrontmatter,
  ContentDocument,
  WithOptionalOgImageSize,
} from '@/shared/content';
import { DEFAULT_LOCALE, type Locale, LOCALES } from '@/shared/i18n';
import type { Described, MaybeTitled } from '@/shared/typings';

export type ConstructMetadataParams = MaybeTitled &
  WithOptionalOgImageSize & {
    description?: string;
    ogDescription?: string; // Separate description for OpenGraph if different from main
    path?: string; // e.g., "/cv" - automatically converted to absolute URL
    /**
     * Site-root path this page defers to, where two URLs serve one page. Left
     * off, a search engine picks its own canonical.
     */
    canonical?: string;
    /**
     * Site-root paths of this page's translations, by BCP-47 tag (or
     * `x-default`). Nothing else marks two addresses as one page in two
     * languages.
     */
    languages?: Record<string, string>;
    ogType?: 'website' | 'profile' | 'article';
    ogImage?: string; // Custom Open Graph image path; the avatar when absent
  };

/**
 * The canonical address and every language's, for a page whose locale is a
 * segment of its own URL. The alternates are load-bearing rather than
 * belt-and-braces: with the locale in a trailing segment, nothing else in the
 * URL says what language the page is in.
 */
export function localizedAddresses(
  address: (locale: Locale) => string,
  locale: Locale,
): Pick<ConstructMetadataParams, 'canonical' | 'languages'> {
  return {
    canonical: address(locale),
    languages: {
      ...Object.fromEntries(
        LOCALES.map((alternate) => [alternate, address(alternate)]),
      ),
      'x-default': address(DEFAULT_LOCALE),
    },
  };
}

export function constructMetadata({
  title,
  description = SITE_CONFIG.tagline,
  ogDescription,
  path,
  canonical,
  languages,
  ogType = 'website',
  ogImage,
  ogImageSize,
}: ConstructMetadataParams = {}): Metadata {
  const { url: siteUrl, name: siteName, author, social, avatar } = SITE_CONFIG;
  const { name: authorName } = author;

  const absoluteUrl = path === undefined ? siteUrl : getAbsoluteUrl(path);
  const absoluteImageUrl = getAbsoluteUrl(ogImage ?? avatar.path);
  const sharedTitle = title ?? siteName;
  const { width, height } = avatar;
  // Published only when known — the avatar's from config, a custom image's
  // from the caller that read the file. A wrong pair is worse than none.
  const imageDimensions =
    ogImage === undefined ? { width, height } : ogImageSize;

  return {
    title,
    description,
    alternates: {
      canonical:
        canonical === undefined ? undefined : getAbsoluteUrl(canonical),
      languages:
        languages === undefined
          ? undefined
          : Object.fromEntries(
              Object.entries(languages).map(([tag, languagePath]) => [
                tag,
                getAbsoluteUrl(languagePath),
              ]),
            ),
    },
    openGraph: {
      type: ogType,
      locale: 'en_US',
      url: absoluteUrl,
      siteName,
      title: sharedTitle,
      description: ogDescription ?? description,
      images: [{ url: absoluteImageUrl, ...imageDimensions, alt: siteName }],
    },
    twitter: {
      card: 'summary_large_image',
      site: social.twitter,
      creator: social.twitter,
      title: sharedTitle,
      description,
      images: [absoluteImageUrl],
    },
    authors: [{ name: authorName, url: siteUrl }],
    creator: siteName,
  };
}

/**
 * Article metadata, routed through `constructMetadata` so a content page's
 * cards are built the same way as the rest of the site's. The title comes from
 * the rendered document rather than from frontmatter — the markdown's own
 * leading heading is the one copy of it.
 */
export function constructArticleMetadata(
  document: ContentDocument<BaseFrontmatter & Described>,
  title: string,
): Metadata {
  const { frontmatter, route, ogImageUrl, ogImageSize } = document;
  const { description } = frontmatter;

  return constructMetadata({
    title,
    description,
    path: route,
    ogType: 'article',
    ogImage: ogImageUrl,
    ogImageSize,
  });
}

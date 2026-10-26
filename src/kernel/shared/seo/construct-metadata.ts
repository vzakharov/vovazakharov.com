import 'server-only';

import type { Metadata } from 'next';

import { getAbsoluteUrl, SITE_CONFIG } from '@/kernel/shared/config';
import { DEFAULT_LOCALE, type Locale, LOCALES } from '@/kernel/shared/i18n';
import type { WithOptionalOgImageSize } from '@/kernel/shared/seo';
import type { MaybeTitled, Routed, Titled } from '@/kernel/shared/typings';

/** A feed a page advertises, by its site-root route. */
export type FeedLink = Routed & Titled;

/** Open Graph's tag for each language, which takes a region where BCP-47 needs none. */
const OG_LOCALES: Record<Locale, string> = { en: 'en_US', ru: 'ru_RU' };

type Addresses = {
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
};

export type ConstructMetadataParams = MaybeTitled &
  WithOptionalOgImageSize &
  Addresses & {
    description?: string;
    ogDescription?: string; // Separate description for OpenGraph if different from main
    /** The unfurl's title, where it differs from the page's own — the tab and the search result keep `title`. */
    ogTitle?: string;
    path?: string; // e.g., "/cv" - automatically converted to absolute URL
    ogType?: 'website' | 'profile' | 'article';
    ogImage?: string; // Custom Open Graph image path; the site's card when absent
    /** A page reachable only by its link, which search engines are asked to leave out. */
    hidden?: boolean;
    /** The page's language, where it is not the site's. */
    locale?: Locale;
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
): Addresses {
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

/**
 * `feeds` go on every page, not only a listing, so a reader handed any of the
 * site's addresses finds them — which makes them the caller's to supply: the
 * collections that publish feeds are blog's.
 */
export function constructMetadata(
  {
    title,
    description = SITE_CONFIG.tagline,
    ogDescription,
    ogTitle,
    path,
    canonical,
    languages,
    ogType = 'website',
    ogImage,
    ogImageSize,
    hidden = false,
    locale = SITE_CONFIG.locale,
  }: ConstructMetadataParams = {},
  feeds: readonly FeedLink[] = [],
): Metadata {
  const {
    url: siteUrl,
    name: siteName,
    author,
    social,
    card: siteImage,
  } = SITE_CONFIG;
  const { name: authorName } = author;

  const absoluteUrl = path === undefined ? siteUrl : getAbsoluteUrl(path);
  const absoluteImageUrl = getAbsoluteUrl(ogImage ?? siteImage.path);
  const sharedTitle = ogTitle ?? title ?? siteName;
  const { width, height } = siteImage;
  // Published only when known — the site image's from config, a custom image's
  // from the caller that read the file. A wrong pair is worse than none.
  const imageDimensions =
    ogImage === undefined ? { width, height } : ogImageSize;
  // Here rather than in the root layout's metadata alone, which a page's own
  // `alternates` would replace wholesale.
  const feedLinks = feeds.map(({ route, title: feedTitle }) => ({
    url: getAbsoluteUrl(route),
    title: feedTitle,
  }));

  return {
    title,
    description,
    ...(hidden && { robots: { index: false } }),
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
      types:
        feedLinks.length === 0
          ? undefined
          : { 'application/rss+xml': feedLinks },
    },
    openGraph: {
      type: ogType,
      locale: OG_LOCALES[locale],
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

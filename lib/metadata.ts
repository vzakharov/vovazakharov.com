import type { Metadata } from 'next';

import { getAbsoluteUrl, SITE_CONFIG } from './site-config';

export type ConstructMetadataParams = {
  title?: string;
  description?: string;
  ogDescription?: string; // Separate description for OpenGraph if different from main
  path?: string; // e.g., "/cv" - automatically converted to absolute URL
  ogType?: 'website' | 'profile' | 'article';
  ogImage?: string; // Custom Open Graph image path (e.g., "/cv_card.png")
};

export function constructMetadata({
  title,
  description = 'Developer, AI tinkerer, word shaker, generative metalhead',
  ogDescription,
  path,
  ogType = 'website',
  ogImage,
}: ConstructMetadataParams = {}): Metadata {
  const { url: siteUrl, name: siteName, author, social, avatar } = SITE_CONFIG;
  const { name: authorName } = author;

  const absoluteUrl = path === undefined ? siteUrl : getAbsoluteUrl(path);
  const absoluteImageUrl = getAbsoluteUrl(ogImage ?? avatar.path);
  // The avatar's intrinsic dimensions describe only the avatar, so a custom
  // image is published without them rather than with the wrong ones.
  const { width, height } = avatar;
  const imageDimensions = ogImage === undefined ? { width, height } : {};

  return {
    title,
    description,
    openGraph: {
      type: ogType,
      locale: 'en_US',
      url: absoluteUrl,
      siteName,
      title: title ?? siteName,
      description: ogDescription ?? description,
      images: [{ url: absoluteImageUrl, ...imageDimensions, alt: siteName }],
    },
    twitter: {
      card: 'summary_large_image',
      site: social.twitter,
      creator: social.twitter,
      title: title ?? siteName,
      description,
      images: [absoluteImageUrl],
    },
    authors: [{ name: authorName, url: siteUrl }],
    creator: siteName,
  };
}

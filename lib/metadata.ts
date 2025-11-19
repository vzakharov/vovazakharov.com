import type { Metadata } from 'next';
import { SITE_CONFIG, getAbsoluteUrl } from './site-config';

export interface ConstructMetadataParams {
  title?: string;
  description?: string;
  ogDescription?: string; // Separate description for OpenGraph if different from main
  path?: string; // e.g., "/cv" - automatically converted to absolute URL
  ogType?: 'website' | 'profile' | 'article';
}

export function constructMetadata({
  title,
  description = 'Developer, AI tinkerer, word shaker, generative metalhead',
  ogDescription,
  path,
  ogType = 'website',
}: ConstructMetadataParams = {}): Metadata {
  const absoluteUrl = path ? getAbsoluteUrl(path) : SITE_CONFIG.url;
  const absoluteImageUrl = getAbsoluteUrl(SITE_CONFIG.avatar.path);
  const finalOgDescription = ogDescription || description;

  return {
    title,
    description,
    openGraph: {
      type: ogType,
      locale: 'en_US',
      url: absoluteUrl,
      siteName: SITE_CONFIG.name,
      title: title || SITE_CONFIG.name,
      description: finalOgDescription,
      images: [
        {
          url: absoluteImageUrl,
          width: SITE_CONFIG.avatar.width,
          height: SITE_CONFIG.avatar.height,
          alt: SITE_CONFIG.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: SITE_CONFIG.social.twitter,
      creator: SITE_CONFIG.social.twitter,
      title: title || SITE_CONFIG.name,
      description,
      images: [absoluteImageUrl],
    },
    authors: [
      {
        name: SITE_CONFIG.author.name,
        url: SITE_CONFIG.url,
      },
    ],
    creator: SITE_CONFIG.name,
  };
}

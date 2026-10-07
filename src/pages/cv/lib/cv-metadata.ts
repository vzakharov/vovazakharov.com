import { SITE_CONFIG } from '@/shared/config';
import { intrinsicDimensions } from '@/shared/content';
import {
  constructMetadata,
  localizedAddresses,
} from '@/shared/seo/index.server-only';

import { cvMessages } from './cv-messages';
import { cvAddressDefaults } from './cv-route-params';
import { type CvAddress, cvCardPath, cvPath } from './cv-urls';

/**
 * The fully-specified address is canonical, so the shorter rungs serving the
 * same page defer to it rather than competing — the indexed URL names both the
 * framing and the language. The address given is the rung actually being
 * served, so each still advertises itself as its own `og:url`.
 *
 * The `hreflang` alternates are load-bearing rather than belt-and-braces: with
 * the locale in a trailing segment, nothing else in a CV URL names its language.
 *
 * The card's size is read off the committed render, so a framing whose card
 * `pnpm content:og` never produced fails the build rather than advertising
 * nothing.
 */
export function generateCvMetadata(address: CvAddress) {
  const { variant, locale, subpage } = cvAddressDefaults(address);
  const { metadata, profilePage } = cvMessages(locale, variant).cv;
  const { description, ogSuffix } = metadata;
  const ogImage = cvCardPath(variant);
  const title = `CV - ${SITE_CONFIG.name}`;

  return constructMetadata({
    title: subpage === undefined ? title : `${profilePage.title} - ${title}`,
    description,
    ogDescription: `${description} ${ogSuffix}`,
    path: cvPath(...address),
    ...localizedAddresses(
      (alternate) =>
        subpage === undefined
          ? cvPath(variant, alternate)
          : cvPath(variant, alternate, subpage),
      locale,
    ),
    ogType: 'profile',
    ogImage,
    ogImageSize: intrinsicDimensions(ogImage),
  });
}

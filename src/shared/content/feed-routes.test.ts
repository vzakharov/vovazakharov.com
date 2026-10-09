import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';

import { SITE_IDS } from '@/shared/config/site-ids';
import { LOCALES } from '@/shared/i18n/locales';

import { collectionsForSite, feedRoutes } from './collections.ts';

const APPS_DIR = path.join(import.meta.dirname, '../../../apps');

/** `apps/<site>/app<route>/route.ts` for every feed the registry names. */
const declared = SITE_IDS.flatMap((site) =>
  collectionsForSite(site).flatMap((id) =>
    feedRoutes(id, LOCALES).map(({ route }) =>
      path.join(site, 'app', route, 'route.ts'),
    ),
  ),
);

/** Every `feed.xml` route handler the routers actually hold. */
const routed = fs
  .readdirSync(APPS_DIR, { recursive: true, encoding: 'utf8' })
  .filter((file) => file.endsWith(path.join('feed.xml', 'route.ts')));

describe('feedRoutes', () => {
  it('puts a rooted collection’s feed at the site root', () => {
    assert.deepEqual(feedRoutes('bible', LOCALES), [{ route: '/feed.xml' }]);
  });

  it('keeps a home-indexed collection’s base in its feed’s address', () => {
    assert.deepEqual(feedRoutes('basilisk-cases', LOCALES), [
      { route: '/cases/feed.xml' },
    ]);
  });

  it('gives a localized collection one feed per language', () => {
    assert.deepEqual(feedRoutes('music', LOCALES), [
      { route: '/music/en/feed.xml', locale: 'en' },
      { route: '/music/ru/feed.xml', locale: 'ru' },
    ]);
  });

  it('gives a collection that publishes none no feed', () => {
    assert.deepEqual(feedRoutes('basilisk-faq', LOCALES), []);
  });

  it('matches the route files the routers hold, both ways', () => {
    assert.deepEqual(routed.toSorted(), declared.toSorted());
  });
});

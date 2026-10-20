Proposed squash body:

```
Each site's router, public/ and Next config live under sites/<domain>/,
and the domain is the site's id throughout: SITE_IDS, NEXT_PUBLIC_SITE,
the site config's keys, each collection's site, in-site.sh and the
per-site package.json entries. A site's url is built from its id.

A scope keeps a site's short name (feat(bible):), which the deploy gate
maps to its domain; preview.yml lists domains. The receivers' deploy-key
secrets keep their names and the gate spells them out; publish-site.sh
derives the receiving repository from the domain.
```

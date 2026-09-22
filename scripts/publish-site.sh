#!/usr/bin/env bash
# Publishes one built site to the repository that serves it. A repository gets
# one Pages site, which `vova` holds, so every other site is force-pushed to a
# receiver of its own. A receiver holds no source: its gh-pages branch is one
# commit, this script force-pushes it, and GitHub Pages is set to "deploy from
# a branch" — so the push *is* the deploy and nothing runs over there.
#
#   scripts/publish-site.sh <site>
#
# Reads PAGES_DEPLOY_KEY: the private half of an ed25519 deploy key whose
# public half is installed on this site's receiving repository with write
# access. The name is fixed rather than per site — the workflow maps the
# site's own secret into it — so adding a receiver never teaches this script a
# secret name. Each receiver's key is its own: one leaked key reaches one site.
# Without the variable this script exits 1 and the site simply stops updating —
# the last deploy stays served.
#
# Rotating one site's key is four commands, from any machine with `gh`:
#
#   ssh-keygen -t ed25519 -f ./pages-key -N "" -C "$site pages deploy key"
#   gh repo deploy-key add ./pages-key.pub --repo "$RECEIVER" \
#     --title "vovazakharov.com CI" --allow-write
#   gh secret set "${site_upper}_PAGES_DEPLOY_KEY" --repo "$SOURCE" < ./pages-key
#   rm ./pages-key ./pages-key.pub   # and delete the old key on the receiver
#
# Rollback needs no history on the far end: every byte here is reproducible
# from a commit in this repository, so an older deploy is this workflow
# dispatched from an older ref.

set -euo pipefail

SITE=${1:?usage: publish-site.sh <site>}
BRANCH=gh-pages

# The one place a site id maps to the repository that serves it. `vova` is
# absent by design: it is this repository's own Pages site and leaves by
# actions/deploy-pages, never through here.
case "$SITE" in
  lsa) RECEIVER=vzakharov/latestageagentic.com ;;
  bible) RECEIVER=vzakharov/agentic.bible ;;
  *)
    printf 'No receiving repository for site %s.\n' "$SITE" >&2
    exit 1
    ;;
esac

cd "$(dirname "$0")/.."

OUT="apps/$SITE/out"

[ -d "$OUT" ] || {
  printf 'No %s — run `pnpm build:%s` first.\n' "$OUT" "$SITE" >&2
  exit 1
}

# Both of these fail silently at the far end: without CNAME, Pages serves the
# built site at its github.io address and the custom domain is dropped from the
# repository's settings; without .nojekyll, Jekyll strips the _next/ directory
# and every page loads blank. They ride in apps/<site>/public/, so a miss here
# means the build lost them rather than that someone forgot a publish step.
for required in CNAME .nojekyll; do
  [ -e "$OUT/$required" ] || {
    printf '%s is missing from %s; refusing to publish.\n' "$required" "$OUT" >&2
    exit 1
  }
done

: "${PAGES_DEPLOY_KEY:?the deploy key for $RECEIVER is not in the environment}"

key=$(mktemp)
known_hosts=$(mktemp)
trap 'rm -f "$key" "$known_hosts"' EXIT

printf '%s\n' "$PAGES_DEPLOY_KEY" > "$key"
chmod 600 "$key"
ssh-keyscan github.com > "$known_hosts" 2>/dev/null

export GIT_SSH_COMMAND="ssh -i $key -o IdentitiesOnly=yes -o UserKnownHostsFile=$known_hosts"

# A repository of its own inside out/, thrown away with the runner: the commit
# it makes is the whole branch, so the receiver never grows.
source_sha=${GITHUB_SHA:-$(git rev-parse HEAD)}

git -C "$OUT" init -q -b "$BRANCH"
git -C "$OUT" add -A
git -C "$OUT" \
  -c user.name='vovazakharov.com CI' \
  -c user.email='noreply@github.com' \
  commit -q -m "Built from $source_sha"

git -C "$OUT" push -f "git@github.com:$RECEIVER.git" "$BRANCH"

printf 'Published %s to %s#%s\n' "$OUT" "$RECEIVER" "$BRANCH"

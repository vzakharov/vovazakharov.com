#!/usr/bin/env bash
# Decides which sites a push publishes, from its commit subjects alone. Which
# subject publishes which site is CLAUDE.md § Deployment; this is where it runs.
#
# Answering "what would this push deploy?" without pushing is why it is a script
# rather than inline YAML:
#
#   git log --format=%s origin/main..HEAD | xargs -d '\n' scripts/deploy-gate.sh
#
# Subjects come from the arguments when there are any, and otherwise from
# COMMITS — the push event's commits as JSON, which is how the workflow passes
# them. Anything that is not a push deploys both sites, which is what makes
# `workflow_dispatch` the way to ship a change no subject would publish.
# GITHUB_OUTPUT and GITHUB_STEP_SUMMARY are written when set, so a local run
# just prints its verdict.

set -euo pipefail

vova=false
lsa=false
subjects=''

if [ "${GITHUB_EVENT_NAME:-push}" != 'push' ]; then
  vova=true
  lsa=true
  verdict='Manual run — deploying both sites regardless of commit subjects.'
else
  if [ "$#" -gt 0 ]; then
    subjects=$(printf '%s\n' "$@")
  else
    # Subject lines only: a body that happens to mention "fix:" is not a fix.
    subjects=$(jq -r '.[].message | split("\n")[0]' <<< "${COMMITS:?no subjects given and COMMITS is unset}")
  fi

  while IFS= read -r subject; do
    [ -n "$subject" ] || continue

    grep -qE '^(feat|fix)(\([^)]+\))?!?:' <<< "$subject" || continue
    scope=$(sed -nE 's/^(feat|fix)(\(([^)]+)\))?!?:.*/\3/p' <<< "$subject")

    case "$scope" in
      lsa) lsa=true ;;
      vova) vova=true ;;
      *) vova=true; lsa=true ;;
    esac
  done <<< "$subjects"

  if [ "$vova" = true ] || [ "$lsa" = true ]; then
    verdict="Deploying — vovazakharov.com: $vova, latestageagentic.com: $lsa."
  else
    verdict='Skipping the deploy — no feat:/fix: subject in this push.'
  fi
fi

{
  echo "vova=$vova"
  echo "lsa=$lsa"
} >> "${GITHUB_OUTPUT:-/dev/null}"

{
  echo "$verdict"
  if [ -n "$subjects" ]; then
    echo
    echo 'Pushed subjects:'
    sed 's/^/- /' <<< "$subjects"
  fi
} | tee -a "${GITHUB_STEP_SUMMARY:-/dev/null}"

#!/bin/sh
# Apply the fleet main-branch ruleset (.github/rulesets/main-protection.json)
# to every PinkBinder repository, creating or updating it by name.
#
# Repository rulesets are plan-gated by GitHub: private repositories require an
# org Team (or higher) plan and public repositories are always allowed. If the
# API answers 403 "Upgrade to GitHub Pro/Team", upgrade the plan (or flip the
# repository public) and re-run this script.
#
# Usage: scripts/apply-rulesets.sh [repo ...]
#   (defaults to the full fleet)
set -eu

ORG=PinkBinder
NAME=main-protection
REPOS="${*:-pink-binder blog-pipeline medusa}"
PAYLOAD="$(dirname "$0")/../.github/rulesets/main-protection.json"

for repo in $REPOS; do
  echo "→ $ORG/$repo"
  existing_id=$(
    gh api "repos/$ORG/$repo/rulesets" --jq ".[] | select(.name == \"$NAME\") | .id" 2>/dev/null || true
  )
  if [ -n "$existing_id" ]; then
    gh api -X PUT "repos/$ORG/$repo/rulesets/$existing_id" --input "$PAYLOAD" --jq '.name + " updated (" + (.id | tostring) + ")"'
  else
    gh api -X POST "repos/$ORG/$repo/rulesets" --input "$PAYLOAD" --jq '.name + " created (" + (.id | tostring) + ")"'
  fi
done

#!/usr/bin/env bash
# Vercel Ignored Build Step: exit 0 = skip deployment, exit 1 = proceed.
# Usage (from repo root): bash scripts/vercel-ignore.sh <turbo-package-name>
# Example: bash scripts/vercel-ignore.sh @repo/blog
set -euo pipefail

PACKAGE="${1:?Pass the Turbo package name, e.g. @repo/blog}"

# Always deploy production (main/master branch).
if [ "${VERCEL_ENV:-}" = "production" ]; then
  exit 1
fi

# True when GitHub reports an open PR for the current branch.
# Vercel omits VERCEL_GIT_PULL_REQUEST_ID when a branch was pushed before the PR
# was opened (even if a PR exists now). See:
# https://vercel.com/docs/environment-variables/system-environment-variables#VERCEL_GIT_PULL_REQUEST_ID
has_open_pull_request_for_branch() {
  local owner="${VERCEL_GIT_REPO_OWNER:-}"
  local repo="${VERCEL_GIT_REPO_SLUG:-}"
  local ref="${VERCEL_GIT_COMMIT_REF:-}"

  if [ -z "$owner" ] || [ -z "$repo" ] || [ -z "$ref" ]; then
    return 1
  fi

  case "$ref" in
    main | master) return 1 ;;
  esac

  local token="${GITHUB_TOKEN:-${GH_TOKEN:-}}"
  local url="https://api.github.com/repos/${owner}/${repo}/pulls?head=${owner}:${ref}&state=open&per_page=1"
  local response
  if [ -n "$token" ]; then
    if ! response="$(
      curl -fsS \
        -H "Authorization: Bearer ${token}" \
        -H 'Accept: application/vnd.github+json' \
        "$url" 2>/dev/null
    )"; then
      return 1
    fi
  elif ! response="$(curl -fsS -H 'Accept: application/vnd.github+json' "$url" 2>/dev/null)"; then
    return 1
  fi

  echo "$response" | node -e "
    const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
    process.exit(Array.isArray(data) && data.length > 0 ? 0 : 1);
  "
}

preview_has_open_pull_request() {
  if [ -n "${VERCEL_GIT_PULL_REQUEST_ID:-}" ]; then
    return 0
  fi

  if has_open_pull_request_for_branch; then
    echo "Proceeding: open pull request found for branch ${VERCEL_GIT_COMMIT_REF:-unknown} (GitHub API fallback)"
    return 0
  fi

  return 1
}

# Preview: only build open pull request deployments (skip branch pushes without a PR).
if ! preview_has_open_pull_request; then
  echo "Skipping: not an open pull request preview"
  echo "Hint: Vercel omits VERCEL_GIT_PULL_REQUEST_ID when commits were pushed before the PR was opened."
  echo "      Push another commit after opening the PR, or add GITHUB_TOKEN to Vercel for API fallback on private repos."
  exit 0
fi

# Skip when this app (and its dependencies) did not change since the last deployment.
if npx --yes turbo-ignore "${PACKAGE}" 2>/dev/null; then
  echo "Skipping: no changes for ${PACKAGE}"
  exit 0
fi

exit 1

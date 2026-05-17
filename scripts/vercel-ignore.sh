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

# Preview: only build open pull request deployments (skip branch pushes without a PR).
if [ -z "${VERCEL_GIT_PULL_REQUEST_ID:-}" ]; then
  echo "Skipping: not an open pull request preview"
  exit 0
fi

# Skip when this app (and its dependencies) did not change since the last deployment.
if npx --yes turbo-ignore "${PACKAGE}" 2>/dev/null; then
  echo "Skipping: no changes for ${PACKAGE}"
  exit 0
fi

exit 1

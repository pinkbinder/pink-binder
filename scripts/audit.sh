#!/usr/bin/env bash
set -euo pipefail

ALLOWLIST=(
  "GHSA-f88m-g3jw-g9cj"  # sharp ≤0.34.5 — Medium severity; 0.35.0 breaks TypeScript type resolution
  "GHSA-mh99-v99m-4gvg"  # bun audit-known — allowlisted to match prior CI gate
)

SCAN_JSON=$(mktemp)
SCAN_ERR=$(mktemp)
FOUND=$(mktemp)
trap 'rm -f "$SCAN_JSON" "$SCAN_ERR" "$FOUND"' EXIT

set +e
osv-scanner scan source --lockfile bun.lock --format json >"$SCAN_JSON" 2>"$SCAN_ERR"
SCAN_STATUS=$?
set -e

cat "$SCAN_ERR" >&2

if [ "$SCAN_STATUS" -ne 0 ] && [ "$SCAN_STATUS" -ne 1 ]; then
  echo "❌ osv-scanner failed with exit code $SCAN_STATUS." >&2
  exit "$SCAN_STATUS"
fi

if ! node - "$SCAN_JSON" >"$FOUND" <<'NODE'
const fs = require('node:fs')

try {
  const report = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
  const ids = new Set()

  for (const result of report.results ?? []) {
    for (const entry of result.packages ?? []) {
      for (const vulnerability of entry.vulnerabilities ?? []) {
        if (typeof vulnerability.id === 'string' && vulnerability.id.length > 0) {
          ids.add(vulnerability.id)
        }
      }
    }
  }

  process.stdout.write([...ids].sort().join('\n'))
} catch (error) {
  console.error(`Invalid osv-scanner JSON: ${error.message}`)
  process.exit(1)
}
NODE
then
  echo "❌ Could not parse osv-scanner output." >&2
  exit 1
fi

if [ "$SCAN_STATUS" -eq 1 ] && [ ! -s "$FOUND" ]; then
  echo "❌ osv-scanner reported vulnerabilities, but no advisory IDs were parsed." >&2
  exit 1
fi

if [ ! -s "$FOUND" ]; then
  echo "✅ No vulnerabilities detected."
  exit 0
fi

NEW=0
while IFS= read -r id || [ -n "$id" ]; do
  [ -z "$id" ] && continue

  is_allowlisted=false
  for allowed_id in "${ALLOWLIST[@]:-}"; do
    if [[ "$id" == "$allowed_id" ]]; then
      is_allowlisted=true
      break
    fi
  done

  if $is_allowlisted; then
    echo "⚪ allowlisted: $id"
  else
    echo "🔴 NEW/unexpected vulnerability: $id"
    NEW=$((NEW + 1))
  fi
done <"$FOUND"

if [ "$NEW" -gt 0 ]; then
  echo
  echo "❌ $NEW new vulnerability(ies) not in allowlist. Review and remediate."
  exit 1
fi

echo
echo "✅ All detected vulnerabilities are explicitly allowlisted."

#!/usr/bin/env bash
set -e

# ==============================================================================
# Cloudflare Pages Deployment Script — BrotherHood Wallet
# Mirrors ~/wallet-v2/deploy/deploy_cloudflare.sh, extended for Web + TWA targets.
#
# Usage:
#   bash scripts/deploy-cloudflare.sh [web|twa] [branch]
#   bash scripts/deploy-cloudflare.sh web main
#   bash scripts/deploy-cloudflare.sh twa main
#
# Environment variables (optional — can also be set in .env or GitHub Secrets):
#   CLOUDFLARE_API_TOKEN          Pages Edit API token
#   CLOUDFLARE_ACCOUNT_ID         Your Cloudflare account ID
#   CLOUDFLARE_PAGES_WEB_PROJECT  Project name for Web (default: brotherhood-wallet)
#   CLOUDFLARE_PAGES_TMA_PROJECT  Project name for TMA/TWA (default: brotherhood-twa)
#   CLOUDFLARE_PAGES_BRANCH       Branch to deploy as (default: main)
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

# Load .env if present
if [ -f .env ]; then
  set -a
  # shellcheck source=/dev/null
  source .env 2>/dev/null || true
  set +a
fi

TARGET="${1:-web}"
TARGET_BRANCH="${2:-}"

# Display help
if [ "${TARGET}" = "-h" ] || [ "${TARGET}" = "--help" ]; then
  echo "Usage: $0 [web|twa] [branch]"
  echo ""
  echo "Arguments:"
  echo "  target   Deploy target: 'web' (standalone PWA) or 'twa' (Telegram Mini App)"
  echo "  branch   Branch name to deploy as (default: main or CLOUDFLARE_PAGES_BRANCH)"
  echo ""
  echo "Environment variables:"
  echo "  CLOUDFLARE_API_TOKEN          API token with Cloudflare Pages Edit permissions"
  echo "  CLOUDFLARE_ACCOUNT_ID         Cloudflare Account ID"
  echo "  CLOUDFLARE_PAGES_WEB_PROJECT  Project for Web (default: brotherhood-wallet)"
  echo "  CLOUDFLARE_PAGES_TMA_PROJECT  Project for TWA (default: brotherhood-twa)"
  echo "  CLOUDFLARE_PAGES_BRANCH       Default target branch (default: main)"
  exit 0
fi

if [ "${TARGET}" != "web" ] && [ "${TARGET}" != "twa" ]; then
  echo "❌ Error: target must be 'web' or 'twa', got '${TARGET}'"
  exit 1
fi

# Determine Cloudflare Pages project name
if [ "${TARGET}" = "twa" ]; then
  PROJECT="${CLOUDFLARE_PAGES_TMA_PROJECT:-brotherhood-twa}"
  DIST_DIR="apps/wallet/dist-twa"
else
  PROJECT="${CLOUDFLARE_PAGES_WEB_PROJECT:-brotherhood-wallet}"
  DIST_DIR="apps/wallet/dist"
fi

# Determine branch
if [ -z "${TARGET_BRANCH}" ]; then
  TARGET_BRANCH="${CLOUDFLARE_PAGES_BRANCH:-main}"
fi

# ---------------------------------------------------------------------------
# Validate dist directory
# ---------------------------------------------------------------------------
if [ ! -d "${DIST_DIR}" ] || [ -z "$(ls -A "${DIST_DIR}" 2>/dev/null)" ]; then
  echo "❌ Error: '${DIST_DIR}' does not exist or is empty."
  echo "Please build first:"
  if [ "${TARGET}" = "twa" ]; then
    echo "  bun run build:twa"
  else
    echo "  bun run build:web"
  fi
  exit 1
fi

# Run post-build copy-to-dist for header enforcement and 404.html
echo "📋 Running post-build copy-to-dist (--target=${TARGET})..."
node scripts/copy-to-dist.mjs --target="${TARGET}"

# Clean up any oversized artifacts (Cloudflare Pages: 25 MiB file limit)
rm -f "${DIST_DIR}/statoscope-build-statistics.json" "${DIST_DIR}/statoscope-report.html"

OVERSIZED_FILES=$(find "${DIST_DIR}" -type f -size +25M 2>/dev/null || true)
if [ -n "$OVERSIZED_FILES" ]; then
  echo "❌ Error: Cloudflare Pages only supports files up to 25 MiB."
  echo "Files exceeding the limit:"
  ls -lh $OVERSIZED_FILES
  exit 1
fi

echo ""
echo "🚀 Deploying to Cloudflare Pages..."
echo "   Target:  ${TARGET}"
echo "   Project: ${PROJECT}"
echo "   Branch:  ${TARGET_BRANCH}"
echo "   Dist:    ${ROOT_DIR}/${DIST_DIR}"

if [ -n "${CLOUDFLARE_API_TOKEN}" ]; then
  echo "   Auth:    CLOUDFLARE_API_TOKEN from environment"
else
  echo "   Auth:    Active Wrangler login session"
fi

# Execute Wrangler Pages deploy
npx wrangler pages deploy "${DIST_DIR}" \
  --project-name="${PROJECT}" \
  --branch="${TARGET_BRANCH}" \
  --commit-dirty=true

echo ""
echo "✅ Deployment completed: ${TARGET} → ${PROJECT}"

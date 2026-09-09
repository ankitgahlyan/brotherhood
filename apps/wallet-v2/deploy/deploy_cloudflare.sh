#!/usr/bin/env bash
set -e

# ==============================================================================
# Cloudflare Pages Deployment Script for Gram Wallet & MyTonWallet
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

# Load environment variables from .env if present
if [ -f .env ]; then
  set -a
  # shellcheck source=/dev/null
  source .env 2>/dev/null || true
  set +a
fi

TARGET_PROJECT="${1:-}"
TARGET_BRANCH="${2:-}"

# Display help
if [ "${TARGET_PROJECT}" = "-h" ] || [ "${TARGET_PROJECT}" = "--help" ]; then
  echo "Usage: $0 [project-name] [branch]"
  echo ""
  echo "Arguments:"
  echo "  project-name   Cloudflare Pages project name (default: gram-wallet or CLOUDFLARE_PAGES_PROJECT)"
  echo "  branch         Branch name to deploy as (default: main or CLOUDFLARE_PAGES_BRANCH)"
  echo ""
  echo "Environment variables (optional):"
  echo "  CLOUDFLARE_API_TOKEN          API token with Cloudflare Pages Edit permissions"
  echo "  CLOUDFLARE_ACCOUNT_ID         Cloudflare Account ID"
  echo "  CLOUDFLARE_PAGES_GRAM_PROJECT Default project name for Gram Wallet (default: gram-wallet)"
  echo "  CLOUDFLARE_PAGES_TMA_PROJECT  Default project name for TMA (default: gram-tma)"
  echo "  CLOUDFLARE_PAGES_BRANCH       Default target branch (default: main)"
  exit 0
fi

# Determine project name
if [ -z "${TARGET_PROJECT}" ]; then
  TARGET_PROJECT="${CLOUDFLARE_PAGES_PROJECT:-${CLOUDFLARE_PAGES_GRAM_PROJECT:-gram-wallet}}"
fi

# Determine branch name (main = production deployment on Cloudflare Pages)
if [ -z "${TARGET_BRANCH}" ]; then
  TARGET_BRANCH="${CLOUDFLARE_PAGES_BRANCH:-main}"
fi

# Verify dist/ directory
if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
  echo "❌ Error: 'dist/' directory does not exist or is empty."
  echo "Please build the web app first:"
  echo "  npm run gram:build:ton      # for Gram Wallet"
  echo "  npm run telegram:build:ton  # for Telegram Mini App"
  exit 1
fi

# Clean up any statoscope or profiling files that exceed Cloudflare Pages 25 MiB limit
rm -f dist/statoscope-build-statistics.json dist/statoscope-report.html

# Verify no remaining file exceeds Cloudflare Pages 25 MiB limit
OVERSIZED_FILES=$(find dist -type f -size +25M 2>/dev/null || true)
if [ -n "$OVERSIZED_FILES" ]; then
  echo "❌ Error: Cloudflare Pages only supports files up to 25 MiB in size."
  echo "The following files exceed this limit:"
  ls -lh $OVERSIZED_FILES
  exit 1
fi

echo "🚀 Preparing deployment to Cloudflare Pages..."
echo "   Project: ${TARGET_PROJECT}"
echo "   Branch:  ${TARGET_BRANCH}"
echo "   Output:  ${ROOT_DIR}/dist"

if [ -d "dist/functions" ]; then
  echo "   Functions: Present (API proxy middleware included)"
else
  echo "   ⚠️ Warning: dist/functions not found. API proxy might not operate on upstream RPCs."
fi

# Check credentials
if [ -n "${CLOUDFLARE_API_TOKEN}" ]; then
  echo "   Auth: Using CLOUDFLARE_API_TOKEN from environment"
else
  echo "   Auth: Using active Wrangler login session"
fi

# Execute Wrangler Pages deploy
npx wrangler pages deploy dist \
  --project-name="${TARGET_PROJECT}" \
  --branch="${TARGET_BRANCH}" \
  --commit-dirty=true

echo "✅ Deployment completed successfully for project: ${TARGET_PROJECT}!"

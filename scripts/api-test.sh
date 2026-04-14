#!/usr/bin/env bash
# =============================================================================
# SellSight — API Test Pipeline
# =============================================================================
# Usage:
#   ./scripts/api-test.sh                    # default API_URL=http://localhost:8080
#   API_URL=http://staging.example.com ./scripts/api-test.sh
#
# What it does:
#   1. Waits for the Spring Boot API to start (polls /v3/api-docs)
#   2. Fetches the live OpenAPI spec and generates a Postman collection via Portman
#   3. Runs the collection through Newman and writes results to scripts/newman-results.json
#
# Prerequisites (install once):
#   npm install   (from the repo root — installs @apideck/portman + newman)
# =============================================================================

set -euo pipefail

API_URL="${API_URL:-http://localhost:8080}"
SPEC_URL="${API_URL}/v3/api-docs"
COLLECTION_OUT="scripts/sellsight-collection.json"
ENV_FILE="scripts/portman-env.json"
RESULTS_OUT="scripts/newman-results.json"
PORTMAN_CONFIG="portman.config.json"

# ── 1. Resolve Node.js tooling ──────────────────────────────────────────────

if command -v npx &>/dev/null; then
  PORTMAN_CMD="npx --yes @apideck/portman"
  NEWMAN_CMD="npx --yes newman"
elif [ -f "node_modules/.bin/portman" ]; then
  PORTMAN_CMD="node_modules/.bin/portman"
  NEWMAN_CMD="node_modules/.bin/newman"
else
  echo "❌  npx not found. Run: npm install"
  exit 1
fi

# ── 2. Wait for the API ──────────────────────────────────────────────────────

echo ""
echo "═══════════════════════════════════════════"
echo "  SellSight API Test Pipeline"
echo "  Target: ${API_URL}"
echo "═══════════════════════════════════════════"

echo ""
echo "⏳  Waiting for API to be ready…"
MAX_RETRIES=30
RETRY=0
until curl --silent --fail "${SPEC_URL}" > /dev/null 2>&1; do
  RETRY=$((RETRY + 1))
  if [ $RETRY -ge $MAX_RETRIES ]; then
    echo ""
    echo "❌  API did not start within $((MAX_RETRIES * 2)) seconds."
    exit 1
  fi
  sleep 2
  printf "."
done
echo ""
echo "✅  API is ready at ${API_URL}"

# ── 3. Generate Postman collection via Portman ───────────────────────────────

echo ""
echo "📋  Generating Postman collection from ${SPEC_URL}…"
$PORTMAN_CMD \
  --url "${SPEC_URL}" \
  --output "${COLLECTION_OUT}" \
  --portmanConfigFile "${PORTMAN_CONFIG}" \
  --envFile "${ENV_FILE}" \
  --syncPostman false

echo "✅  Collection written to ${COLLECTION_OUT}"

# ── 4. Run Newman tests ──────────────────────────────────────────────────────

echo ""
echo "🧪  Running Newman tests…"
$NEWMAN_CMD run "${COLLECTION_OUT}" \
  --environment "${ENV_FILE}" \
  --reporters cli,json \
  --reporter-json-export "${RESULTS_OUT}" \
  --timeout-request 5000 \
  --bail

echo ""
echo "✅  API tests passed! Results: ${RESULTS_OUT}"

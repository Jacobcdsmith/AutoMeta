#!/bin/bash
# AutoMeta Integration Test Suite
# Tests all backend services and API endpoints

set -e

echo "🧪 AutoMeta Integration Test Suite"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0

# Helper functions
test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    local data=${4:-}

    echo -n "Testing ${name}... "

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null || echo "000")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" "$url" 2>/dev/null || echo "000")
    fi

    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

echo "1️⃣  Testing LLM Gateway (http://localhost:8000)"
echo "------------------------------------------------"
test_endpoint "LLM Gateway Health" "http://localhost:8000/health"
test_endpoint "LLM Gateway Root" "http://localhost:8000/"

if test_endpoint "LLM Gateway Generate" "http://localhost:8000/generate" "POST" \
    '{"prompt":"Say hello","platform":"twitter"}'; then
    echo "   ↳ Content generation working! 🎉"
fi
echo ""

echo "2️⃣  Testing Puppeteer Runner (http://localhost:3000)"
echo "---------------------------------------------------"
test_endpoint "Puppeteer Health" "http://localhost:3000/health"
test_endpoint "Puppeteer State" "http://localhost:3000/state"
echo ""

echo "3️⃣  Testing MCP Server (http://localhost:3003)"
echo "----------------------------------------------"
test_endpoint "MCP Health" "http://localhost:3003/health" || echo "   ⚠️  MCP Server may not be available (optional)"
echo ""

echo "4️⃣  Testing Frontend (http://localhost:3001)"
echo "--------------------------------------------"
test_endpoint "Frontend Root" "http://localhost:3001/" || echo "   ⚠️  Frontend not running (run 'docker compose up -d' to start)"
echo ""

# Summary
echo "=================================="
echo "Test Results:"
echo "  ${GREEN}✓ Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
    echo "  ${RED}✗ Failed: $FAILED${NC}"
else
    echo "  ${GREEN}All tests passed!${NC} 🎉"
fi
echo ""

# Service status check
echo "📊 Docker Service Status:"
echo "=================================="
docker compose ps 2>/dev/null || echo "Docker Compose not running in this directory"
echo ""

# Exit with error if any tests failed
if [ $FAILED -gt 0 ]; then
    echo "${RED}Some tests failed. Check the output above for details.${NC}"
    exit 1
else
    echo "${GREEN}All systems operational! ✨${NC}"
    exit 0
fi

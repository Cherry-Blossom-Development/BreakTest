#!/bin/bash
#
# run-tests.sh - Run E2E tests against dev or production
#
# Usage:
#   ./run-tests.sh ios dev          # Run iOS tests against dev
#   ./run-tests.sh ios production   # Run iOS tests against production
#   ./run-tests.sh android dev      # Run Android tests against dev
#   ./run-tests.sh web dev          # Run web tests against dev
#

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

write_step() { echo -e "\n${CYAN}--- $1 ---${NC}"; }
write_ok()   { echo -e "  ${GREEN}[ OK ]${NC}  $1"; }
write_info() { echo -e "  ${YELLOW}[ .. ]${NC}  $1"; }
write_fail() { echo -e "  ${RED}[FAIL]${NC}  $1"; exit 1; }

# Parse arguments
PLATFORM=${1:-ios}
ENVIRONMENT=${2:-dev}

if [[ ! "$PLATFORM" =~ ^(ios|android|web)$ ]]; then
    echo "Usage: $0 <ios|android|web> <dev|production>"
    exit 1
fi

if [[ ! "$ENVIRONMENT" =~ ^(dev|production)$ ]]; then
    echo "Usage: $0 <ios|android|web> <dev|production>"
    exit 1
fi

echo ""
echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}   Breakroom E2E Test Runner             ${NC}"
echo -e "${CYAN}   Platform: $PLATFORM                   ${NC}"
echo -e "${CYAN}   Environment: $ENVIRONMENT             ${NC}"
echo -e "${CYAN}==========================================${NC}"

# Check environment file exists
ENV_FILE="$SCRIPT_DIR/.env.test.$ENVIRONMENT"
if [ ! -f "$ENV_FILE" ]; then
    write_fail "Environment file not found: $ENV_FILE"
fi

# For iOS/Android, ensure Appium is running
if [[ "$PLATFORM" == "ios" || "$PLATFORM" == "android" ]]; then
    write_step "Checking Appium"
    if lsof -i :4723 -sTCP:LISTEN >/dev/null 2>&1; then
        write_ok "Appium running on port 4723"
    else
        write_info "Starting Appium..."
        cd "$SCRIPT_DIR"
        npx appium --base-path / --address localhost --port 4723 > /dev/null 2>&1 &
        APPIUM_PID=$!
        sleep 5
        if lsof -i :4723 -sTCP:LISTEN >/dev/null 2>&1; then
            write_ok "Appium started (PID: $APPIUM_PID)"
        else
            write_fail "Failed to start Appium"
        fi
    fi
fi

# For iOS, check simulator
if [[ "$PLATFORM" == "ios" ]]; then
    write_step "Checking iOS Simulator"
    SIMULATOR_STATE=$(xcrun simctl list devices | grep "Booted" | head -1 || echo "")
    if [ -n "$SIMULATOR_STATE" ]; then
        write_ok "Simulator running"
    else
        write_info "No simulator running - starting one..."
        SIMULATOR_UDID=$(xcrun simctl list devices available | grep -E "iPhone (17|16|15)" | head -1 | sed 's/.*(\([A-F0-9-]*\)).*/\1/')
        if [ -n "$SIMULATOR_UDID" ]; then
            xcrun simctl boot "$SIMULATOR_UDID" 2>/dev/null || true
            open -a Simulator
            sleep 5
            write_ok "Simulator started"
        else
            write_fail "No iPhone simulator found"
        fi
    fi
fi

# Setup test data
write_step "Setting up test data"
cd "$SCRIPT_DIR"
npx ts-node database/setup-test-data.ts "$ENVIRONMENT" 2>&1 | tail -5
write_ok "Test data ready"

# Run tests
write_step "Running $PLATFORM tests against $ENVIRONMENT"
echo ""

cd "$SCRIPT_DIR"
TEST_ENV=$ENVIRONMENT npm run test:$PLATFORM
TEST_EXIT=$?

# Cleanup
if [ -n "$APPIUM_PID" ]; then
    kill $APPIUM_PID 2>/dev/null || true
fi

# Summary
echo ""
echo -e "${CYAN}==========================================${NC}"
if [ $TEST_EXIT -eq 0 ]; then
    echo -e "${GREEN}  All tests passed!${NC}"
else
    echo -e "${RED}  Tests finished with failures (exit $TEST_EXIT)${NC}"
fi
echo -e "${CYAN}==========================================${NC}"
echo ""
echo -e "  Results reported to: ${ENVIRONMENT}.prosaurus.com"
echo ""

exit $TEST_EXIT

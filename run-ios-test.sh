#!/bin/bash
#
# run-ios-test.sh
# Sets up the iOS test environment and runs the E2E test suite.
#
# This script handles the full pre-flight checklist so tests can run without manual steps:
#
#   1. Ensures Docker is running
#   2. Ensures the Breakroom test containers are up (backend on port 3001)
#   3. Ensures an iOS Simulator is running
#   4. Ensures the iOS app is built for the test API (rebuilds if needed)
#   5. Starts Appium server
#   6. Resets the test database to a clean state
#   7. Runs the iOS E2E tests
#
# Usage:
#   ./run-ios-test.sh
#   ./run-ios-test.sh --skip-db         # Skip the test database reset
#   ./run-ios-test.sh --force-rebuild   # Rebuild the iOS app even if already built
#
# After testing, run:
#   cd ../Breakroom-iPhone && ./restore-production.sh

set -e

# --- Paths ---
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BREAKROOM_DIR="$(cd "$SCRIPT_DIR/../Breakroom" 2>/dev/null && pwd)" || BREAKROOM_DIR=""
IPHONE_DIR="$(cd "$SCRIPT_DIR/../Breakroom-iPhone" 2>/dev/null && pwd)" || IPHONE_DIR=""
APP_BUNDLE_ID="com.cherryblossomdev.Breakroom"
APPS_DIR="$SCRIPT_DIR/apps"

# --- Parse arguments ---
SKIP_DB=false
FORCE_REBUILD=false
for arg in "$@"; do
    case $arg in
        --skip-db)       SKIP_DB=true ;;
        --force-rebuild) FORCE_REBUILD=true ;;
    esac
done

# --- Colors for output ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

write_step() { echo -e "\n${CYAN}--- $1 ---${NC}"; }
write_ok()   { echo -e "  ${GREEN}[ OK ]${NC}  $1"; }
write_info() { echo -e "  ${YELLOW}[ .. ]${NC}  $1"; }
write_fail() { echo -e "  ${RED}[FAIL]${NC}  $1"; exit 1; }

wait_for_port() {
    local port=$1
    local timeout=${2:-90}
    local label=${3:-"service"}
    write_info "Waiting for $label on port $port..."
    local elapsed=0
    while [ $elapsed -lt $timeout ]; do
        # Check both IPv4 and IPv6 using lsof
        if lsof -i :$port -sTCP:LISTEN >/dev/null 2>&1; then
            write_ok "$label is ready on port $port"
            return 0
        fi
        sleep 3
        elapsed=$((elapsed + 3))
    done
    write_fail "$label did not become available on port $port within ${timeout}s."
}

# ------------------------------------------------------------------------------
echo ""
echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}   Breakroom iOS E2E Test Runner         ${NC}"
echo -e "${CYAN}==========================================${NC}"

# --- 1. Docker ---
write_step "1/7  Docker"

if docker info >/dev/null 2>&1; then
    write_ok "Docker daemon is running"
else
    write_info "Docker not responding - starting Docker Desktop..."
    open -a Docker
    write_info "Waiting for Docker daemon (up to 90s)..."
    elapsed=0
    while [ $elapsed -lt 90 ]; do
        sleep 5
        elapsed=$((elapsed + 5))
        if docker info >/dev/null 2>&1; then
            break
        fi
    done
    if ! docker info >/dev/null 2>&1; then
        write_fail "Docker daemon did not start in time. Start Docker Desktop manually and retry."
    fi
    write_ok "Docker is ready"
fi

# --- 2. Test containers ---
write_step "2/7  Breakroom test containers (port 3001)"

if [ -z "$BREAKROOM_DIR" ] || [ ! -f "$BREAKROOM_DIR/docker-compose.test.yml" ]; then
    write_fail "Breakroom repo not found at ../Breakroom"
fi

if lsof -i :3001 -sTCP:LISTEN >/dev/null 2>&1; then
    write_ok "Test backend already running on port 3001"
else
    write_info "Starting test containers..."
    pushd "$BREAKROOM_DIR" > /dev/null
    docker compose -f docker-compose.test.yml --env-file .env.test up -d
    EXIT_CODE=$?
    popd > /dev/null
    if [ $EXIT_CODE -ne 0 ]; then
        write_fail "docker compose failed (exit $EXIT_CODE)"
    fi
    wait_for_port 3001 120 "test backend"
fi

# --- 3. iOS Simulator ---
write_step "3/7  iOS Simulator"

# Find a suitable simulator (prefer iPhone 17)
SIMULATOR_UDID=$(xcrun simctl list devices available | grep -E "iPhone (17|16|Air)" | head -1 | sed 's/.*(\([A-F0-9-]*\)).*/\1/')
if [ -z "$SIMULATOR_UDID" ]; then
    SIMULATOR_UDID=$(xcrun simctl list devices available | grep "iPhone" | head -1 | sed 's/.*(\([A-F0-9-]*\)).*/\1/')
fi
if [ -z "$SIMULATOR_UDID" ]; then
    write_fail "No iPhone simulator found. Create one in Xcode (Window > Devices and Simulators)."
fi

SIMULATOR_NAME=$(xcrun simctl list devices available | grep "$SIMULATOR_UDID" | head -1 | sed 's/ *\(.*\) (.*/\1/')

# Check if simulator is booted
SIMULATOR_STATE=$(xcrun simctl list devices | grep "$SIMULATOR_UDID" | grep -o "(Booted)" || echo "")
if [ -n "$SIMULATOR_STATE" ]; then
    write_ok "Simulator already running: $SIMULATOR_NAME"
else
    write_info "Booting simulator: $SIMULATOR_NAME"
    xcrun simctl boot "$SIMULATOR_UDID" 2>/dev/null || true
    open -a Simulator

    # Wait for simulator to boot
    write_info "Waiting for simulator to boot..."
    elapsed=0
    while [ $elapsed -lt 60 ]; do
        sleep 3
        elapsed=$((elapsed + 3))
        SIMULATOR_STATE=$(xcrun simctl list devices | grep "$SIMULATOR_UDID" | grep -o "(Booted)" || echo "")
        if [ -n "$SIMULATOR_STATE" ]; then
            break
        fi
    done
    if [ -z "$SIMULATOR_STATE" ]; then
        write_fail "Simulator did not boot within 60 seconds."
    fi
    write_ok "Simulator is running"
fi

# --- 4. iOS app build ---
write_step "4/7  iOS app environment"

if [ -z "$IPHONE_DIR" ] || [ ! -f "$IPHONE_DIR/Breakroom.xcodeproj/project.pbxproj" ]; then
    write_fail "Breakroom-iPhone repo not found at ../Breakroom-iPhone"
fi

# Check current environment
CURRENT_ENV=$(grep 'static let environment' "$IPHONE_DIR/Breakroom/Config.swift" 2>/dev/null | sed 's/.*"\(.*\)".*/\1/')
SWITCHED=false

if [ "$CURRENT_ENV" != "test" ]; then
    write_info "Switching environment: '$CURRENT_ENV' -> 'test'"
    "$IPHONE_DIR/switch-env.sh" test > /dev/null
    SWITCHED=true
else
    write_ok "Already pointing at test environment"
fi

# Build if switched or force rebuild
if [ "$SWITCHED" = true ] || [ "$FORCE_REBUILD" = true ]; then
    if [ "$FORCE_REBUILD" = true ] && [ "$SWITCHED" = false ]; then
        write_info "Force rebuild requested"
    fi
    write_info "Building iOS app..."

    xcodebuild -project "$IPHONE_DIR/Breakroom.xcodeproj" \
        -scheme Breakroom \
        -configuration Debug \
        -destination "id=$SIMULATOR_UDID" \
        -derivedDataPath "$IPHONE_DIR/build" \
        -quiet \
        build 2>&1

    if [ $? -ne 0 ]; then
        write_fail "xcodebuild failed"
    fi
    write_ok "Build succeeded"

    # Copy app bundle to BreakTest/apps/
    APP_PATH=$(find "$IPHONE_DIR/build" -name "Breakroom.app" -path "*/Debug-iphonesimulator/*" -type d 2>/dev/null | head -1)
    if [ -z "$APP_PATH" ]; then
        write_fail "Could not find built Breakroom.app"
    fi

    mkdir -p "$APPS_DIR"
    rm -rf "$APPS_DIR/Breakroom.app"
    cp -R "$APP_PATH" "$APPS_DIR/"
    write_ok "App copied to BreakTest/apps/"

    # Install on simulator
    write_info "Installing app on simulator..."
    xcrun simctl install "$SIMULATOR_UDID" "$APPS_DIR/Breakroom.app"
    write_ok "App installed on simulator"
else
    # Check if app is installed
    INSTALLED=$(xcrun simctl listapps "$SIMULATOR_UDID" 2>/dev/null | grep "$APP_BUNDLE_ID" || echo "")
    if [ -z "$INSTALLED" ]; then
        if [ ! -d "$APPS_DIR/Breakroom.app" ]; then
            write_fail "App not installed and no app bundle found at $APPS_DIR/Breakroom.app\n  Run with --force-rebuild to build it."
        fi
        write_info "App not installed on simulator - installing existing bundle..."
        xcrun simctl install "$SIMULATOR_UDID" "$APPS_DIR/Breakroom.app"
        write_ok "App installed"
    else
        write_ok "App already installed on simulator"
    fi
fi

# --- 5. Appium server ---
write_step "5/7  Appium server"

if lsof -i :4723 -sTCP:LISTEN >/dev/null 2>&1; then
    write_ok "Appium already running on port 4723"
else
    write_info "Starting Appium server..."
    pushd "$SCRIPT_DIR" > /dev/null
    npx appium --base-path / --address localhost --port 4723 > /dev/null 2>&1 &
    APPIUM_PID=$!
    popd > /dev/null

    # Wait for Appium to start
    wait_for_port 4723 30 "Appium"
    write_info "Appium PID: $APPIUM_PID (will be stopped when tests complete)"
fi

# --- 6. Test database ---
write_step "6/7  Test database"

if [ "$SKIP_DB" = true ]; then
    write_info "Skipped (--skip-db)"
else
    write_info "Resetting breakroom_test to a clean state..."
    pushd "$SCRIPT_DIR" > /dev/null
    npx ts-node database/setup.ts
    DB_EXIT=$?
    popd > /dev/null
    if [ $DB_EXIT -ne 0 ]; then
        write_fail "Database setup failed (exit $DB_EXIT)"
    fi
    write_ok "Test database reset successfully"
fi

# --- 7. Run tests ---
write_step "7/7  Running tests"
echo ""

pushd "$SCRIPT_DIR" > /dev/null
npm run test:ios
TEST_EXIT=$?
popd > /dev/null

# --- Cleanup: Stop Appium if we started it ---
if [ -n "$APPIUM_PID" ]; then
    kill $APPIUM_PID 2>/dev/null || true
fi

# --- Summary ---
echo ""
echo -e "${CYAN}==========================================${NC}"
if [ $TEST_EXIT -eq 0 ]; then
    echo -e "${GREEN}  All tests passed!${NC}"
else
    echo -e "${RED}  Tests finished with failures (exit $TEST_EXIT)${NC}"
fi
echo -e "${CYAN}==========================================${NC}"
echo ""
echo -e "  Restore production:  cd ../Breakroom-iPhone && ./restore-production.sh"
echo ""

exit $TEST_EXIT

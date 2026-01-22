#!/bin/bash

# BreakTest - Test Runner Script
# Starts the Breakroom application and runs WebdriverIO tests

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BREAKTEST_DIR="$(dirname "$SCRIPT_DIR")"
BREAKROOM_DIR="$(dirname "$BREAKTEST_DIR")/Breakroom"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
MAX_WAIT_TIME=120  # seconds to wait for app to be ready
HEALTH_CHECK_URL="https://local.prosaurus.com"
STOP_APP_AFTER=${STOP_APP_AFTER:-false}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  BreakTest - Test Runner${NC}"
echo -e "${GREEN}========================================${NC}"

# Function to check if the app is running
check_app_health() {
    curl -sk --max-time 5 "$HEALTH_CHECK_URL" > /dev/null 2>&1
    return $?
}

# Function to start the Breakroom application
start_app() {
    echo -e "${YELLOW}Starting Breakroom application...${NC}"

    if [ ! -d "$BREAKROOM_DIR" ]; then
        echo -e "${RED}Error: Breakroom directory not found at $BREAKROOM_DIR${NC}"
        exit 1
    fi

    cd "$BREAKROOM_DIR"

    # Start containers in detached mode
    ./build.sh local up &
    APP_PID=$!

    # Give it a moment to start
    sleep 5

    echo -e "${YELLOW}Waiting for application to be ready...${NC}"

    WAIT_TIME=0
    while ! check_app_health; do
        if [ $WAIT_TIME -ge $MAX_WAIT_TIME ]; then
            echo -e "${RED}Timeout: Application did not become ready within ${MAX_WAIT_TIME} seconds${NC}"
            exit 1
        fi
        echo -n "."
        sleep 5
        WAIT_TIME=$((WAIT_TIME + 5))
    done

    echo ""
    echo -e "${GREEN}Application is ready!${NC}"
}

# Function to stop the Breakroom application
stop_app() {
    echo -e "${YELLOW}Stopping Breakroom application...${NC}"
    cd "$BREAKROOM_DIR"
    docker compose -f docker-compose.local.yml down
    echo -e "${GREEN}Application stopped.${NC}"
}

# Function to run tests
run_tests() {
    echo -e "${YELLOW}Running WebdriverIO tests...${NC}"
    cd "$BREAKTEST_DIR"

    # Parse arguments for test type
    TEST_TYPE=${1:-web}

    case $TEST_TYPE in
        web)
            npm run test:web
            ;;
        web:headless)
            npm run test:web:headless
            ;;
        android)
            npm run test:android
            ;;
        ios)
            npm run test:ios
            ;;
        all)
            npm run test:all
            ;;
        *)
            echo -e "${RED}Unknown test type: $TEST_TYPE${NC}"
            echo "Available types: web, web:headless, android, ios, all"
            exit 1
            ;;
    esac
}

# Main execution
main() {
    # Check if app is already running
    if check_app_health; then
        echo -e "${GREEN}Application is already running.${NC}"
    else
        start_app
    fi

    # Run the tests
    TEST_EXIT_CODE=0
    run_tests "$1" || TEST_EXIT_CODE=$?

    # Stop app if requested
    if [ "$STOP_APP_AFTER" = "true" ]; then
        stop_app
    fi

    # Report results
    echo ""
    echo -e "${GREEN}========================================${NC}"
    if [ $TEST_EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}  Tests completed successfully!${NC}"
    else
        echo -e "${RED}  Tests failed with exit code: $TEST_EXIT_CODE${NC}"
    fi
    echo -e "${GREEN}========================================${NC}"

    exit $TEST_EXIT_CODE
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [test-type] [options]"
        echo ""
        echo "Test types:"
        echo "  web          Run web tests (default)"
        echo "  web:headless Run web tests in headless mode"
        echo "  android      Run Android tests"
        echo "  ios          Run iOS tests"
        echo "  all          Run all tests"
        echo ""
        echo "Environment variables:"
        echo "  STOP_APP_AFTER=true  Stop the application after tests"
        echo ""
        exit 0
        ;;
    --stop)
        stop_app
        exit 0
        ;;
    *)
        main "$1"
        ;;
esac

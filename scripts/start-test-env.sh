#!/bin/bash
# Start the Breakroom test environment
# This runs on different ports than the local dev environment

set -e

BREAKROOM_DIR="${BREAKROOM_DIR:-$(dirname "$0")/../../Breakroom}"
cd "$BREAKROOM_DIR"

echo "Starting Breakroom test environment..."
echo "Using database: breakroom_test"
echo ""

# Start the test containers
docker compose -f docker-compose.test.yml --env-file .env.test up -d

echo ""
echo "Test environment started!"
echo "  Frontend: https://test.prosaurus.com:8443"
echo "  Backend:  https://test.prosaurus.com:8443/api"
echo ""
echo "Make sure test.prosaurus.com is in your hosts file:"
echo "  127.0.0.1 test.prosaurus.com"
echo ""
echo "To view logs: docker compose -f docker-compose.test.yml logs -f"
echo "To stop: npm run test:env:stop (in BreakTest directory)"

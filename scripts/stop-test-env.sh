#!/bin/bash
# Stop the Breakroom test environment

BREAKROOM_DIR="${BREAKROOM_DIR:-$(dirname "$0")/../../Breakroom}"
cd "$BREAKROOM_DIR"

echo "Stopping Breakroom test environment..."
docker compose -f docker-compose.test.yml down

echo "Test environment stopped."

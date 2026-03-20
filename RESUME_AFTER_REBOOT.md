# Resume iOS E2E Test Debugging After Reboot

## Current Status: ALL TESTS PASSING

All iOS E2E tests are working:
- **Login**: 6 tests passing
- **Forgot Password**: 7 tests passing
- **Signup**: 3 tests passing (1 skipped)
- **Chat**: 6 tests passing

## After Reboot Steps

```bash
# 1. Start Docker Desktop
open -a Docker

# 2. Wait ~30 seconds for Docker to fully start, then verify backend
docker ps | grep backend

# 3. If backend not running, start it:
cd /Users/dcaley/Developer/Breakroom
docker compose -f docker-compose.test.yml up -d

# 4. Verify API is accessible
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"handle":"testuser","password":"TestPass123"}'

# 5. Run all iOS tests
cd /Users/dcaley/Developer/BreakTest
./node_modules/.bin/wdio run ./config/wdio.ios.conf.ts
```

## Issues Fixed

### Issue 1: Login succeeds but app stays on login screen
**Root Cause**: The `/api/moderation/blocks` endpoint only accepted cookie-based auth, not Authorization header tokens. When the iOS app called this endpoint after login, it returned 401, triggering session expiration.

**Fix**: Updated `backend/routes/moderation.js` to accept both cookie and Authorization header tokens:
```javascript
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return req.cookies.jwtToken;
}
```

### Issue 2: Chat test can't find tab bar buttons
**Root Cause**: The test used `~tabChat` selector which matched the accessibility identifier on the content view (ChatListView), not the tab bar button. SwiftUI's `.accessibilityIdentifier()` on a view inside TabView applies to the content, not the tab item.

**Fix**: Updated `BreakTest/test/ios/chat.spec.ts` to use SF Symbol names for tab bar buttons:
- Chat tab: `~bubble.left.and.bubble.right` (instead of `~tabChat`)
- Breakroom tab: `~square.grid.2x2` (instead of `~tabBreakroom`)

### Issue 3: Test results not appearing on production page
**Root Cause**: `.env.test` had incorrect URL `https://test.prosaurus.com:8443/api/test-results`

**Fix**: Changed to `BREAKROOM_API_URL=https://www.prosaurus.com/api/test-results`

## Files Modified
- `BreakTest/test/ios/chat.spec.ts` - Fixed tab bar button selectors
- `BreakTest/pages/ios/LoginPage.ts` - setValue() for text input
- `BreakTest/config/wdio.ios.conf.ts` - iPhone 17 Pro device
- `BreakTest/.env.test` - Fixed API URL
- `Breakroom/backend/routes/moderation.js` - Added Authorization header support

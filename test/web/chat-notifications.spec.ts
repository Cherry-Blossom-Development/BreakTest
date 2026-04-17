import LoginPage from '../../pages/web/LoginPage';
import ChatPage from '../../pages/web/ChatPage';
import TestUsers from '../data/testUsers';

/**
 * Chat Notification Tests
 *
 * Verifies that the unread message badge appears in the sidebar when another
 * user sends a message to a shared room.
 *
 * Flow:
 *   1. (before) Login as testuser and mark all rooms as read — clean baseline
 *   2. (before) Login as testadmin and send a message to the General room
 *   3. (test)   Login as testuser, navigate to /chat, verify badge appears
 *   4. (after)  Mark rooms as read and logout — clean state for next run
 *
 * Requires: both test users must be members of the General room (set in seed data).
 */
describe('Breakroom Web - Chat Notifications', () => {
    const ROOM_NAME = 'General';

    async function apiLogout(): Promise<void> {
        await browser.execute(async () => {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        });
        await browser.pause(500);
    }

    async function markAllRoomsRead(): Promise<void> {
        await browser.execute(async () => {
            await fetch('/api/chat/rooms/mark-all-read', {
                method: 'POST',
                credentials: 'include',
            });
        });
        await browser.pause(500);
    }

    before(async () => {
        // Phase 1: Login as testuser and mark all rooms as read so we start
        // from a known state regardless of what previous test runs left behind.
        await LoginPage.open();
        await LoginPage.login(TestUsers.standard.handle, TestUsers.standard.password);
        await browser.pause(2000);

        await markAllRoomsRead();
        await apiLogout();

        // Phase 2: Login as testadmin and send a message to the General room.
        // This is the message that testuser should see a badge for.
        await LoginPage.open();
        await LoginPage.login(TestUsers.admin.handle, TestUsers.admin.password);
        await browser.pause(2000);

        await browser.url('/chat');
        await browser.pause(2000);

        await ChatPage.selectRoom(ROOM_NAME);
        await browser.pause(1000);

        const message = `Notification test ${Date.now()}`;
        await ChatPage.sendMessage(message);
        await browser.pause(1000);

        await apiLogout();
    });

    it('should show an unread badge on the room when another user sends a message', async () => {
        // Login as testuser — the badge count is loaded from the API on login
        await LoginPage.open();
        await LoginPage.login(TestUsers.standard.handle, TestUsers.standard.password);
        await browser.pause(2000);

        // Navigate to /chat so the sidebar room list becomes visible
        await browser.url('/chat');
        await browser.pause(2000);

        // The General room should show a red badge indicating unread messages
        const badge = await ChatPage.getRoomBadge(ROOM_NAME);
        await badge.waitForDisplayed({ timeout: 5000 });

        expect(await badge.isDisplayed()).toBe(true);

        const badgeCount = parseInt(await badge.getText(), 10);
        expect(badgeCount).toBeGreaterThan(0);
    });

    after(async () => {
        // Leave clean state: mark rooms as read and logout testuser
        await markAllRoomsRead();
        await apiLogout();
    });
});

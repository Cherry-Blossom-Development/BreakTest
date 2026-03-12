import LoginPage from '../../pages/ios/LoginPage';
import ChatPage from '../../pages/ios/ChatPage';
import TestUsers from '../data/testUsers';

const BUNDLE_ID = 'com.cherryblossomdev.Breakroom';

async function loginAndNavigateToChat(): Promise<void> {
    try {
        await driver.terminateApp(BUNDLE_ID);
    } catch {
        // App might not be running
    }
    // Use launchApp to re-apply launch arguments including CLEAR_AUTH_STATE
    await driver.execute('mobile: launchApp', {
        bundleId: BUNDLE_ID,
        arguments: ['-CLEAR_AUTH_STATE', 'YES', '-TEST_API_URL', 'http://localhost:3001'],
    });
    await LoginPage.waitForAppReady();
    await LoginPage.login(TestUsers.standard.handle, TestUsers.standard.password);

    // Verify login succeeded by checking login screen is gone
    await driver.pause(5000);
    const isLoginDisplayed = await LoginPage.isDisplayed();
    if (isLoginDisplayed) {
        // Take screenshot to debug
        const screenshot = await driver.takeScreenshot();
        console.log('Login screen still displayed, screenshot:', screenshot.substring(0, 100) + '...');
        throw new Error('Login failed - still on login screen');
    }

    // Debug: get page source to see what's on screen
    console.log('Login screen gone, waiting for tabs...');

    // Dismiss any permission prompts or modals that may appear after login
    const notNowButton = await $('~Not Now');
    if (await notNowButton.isDisplayed().catch(() => false)) {
        console.log('Found "Not Now" button, dismissing prompt...');
        await notNowButton.click();
        await driver.pause(1000);
    }

    const cancelButton = await $('~Cancel');
    if (await cancelButton.isDisplayed().catch(() => false)) {
        console.log('Found Cancel button, dismissing modal...');
        await cancelButton.click();
        await driver.pause(1000);
    }

    // Find the Chat tab button in the tab bar by its SF Symbol icon name
    const chatTabButton = await $('~bubble.left.and.bubble.right');
    await chatTabButton.waitForDisplayed({ timeout: 30000 });
    await chatTabButton.click();
}

describe('Breakroom iOS - Chat', () => {
    before(async () => {
        await loginAndNavigateToChat();
    });

    it('should display the room list', async () => {
        await ChatPage.waitForRoomList();
        const isDisplayed = await ChatPage.isRoomListDisplayed();
        expect(isDisplayed).toBe(true);
    });

    it('should have at least one room', async () => {
        await ChatPage.waitForRoomList();
        const count = await ChatPage.getRoomCount();
        expect(count).toBeGreaterThan(0);
    });

    it('should open a chat room', async () => {
        await ChatPage.waitForRoomList();
        await ChatPage.openFirstRoom();

        await driver.pause(2000);

        const isChatDisplayed = await ChatPage.isChatRoomDisplayed();
        expect(isChatDisplayed).toBe(true);
    });

    it('should display the message input field', async () => {
        await ChatPage.waitForChatRoom();
        await expect(ChatPage.messageInput).toBeDisplayed();
    });

    it('should display the send button', async () => {
        await ChatPage.waitForChatRoom();
        await expect(ChatPage.sendButton).toBeDisplayed();
    });

    it('should send a message successfully', async () => {
        await ChatPage.waitForChatRoom();
        await ChatPage.sendMessage('Hello from BreakTest iOS');

        await driver.pause(3000);

        // Verify we're still on the chat screen (send didn't cause a crash/error)
        const isChatDisplayed = await ChatPage.isChatRoomDisplayed();
        expect(isChatDisplayed).toBe(true);
    });
});

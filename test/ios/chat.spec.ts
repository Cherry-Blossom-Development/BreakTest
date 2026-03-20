import LoginPage from '../../pages/ios/LoginPage';
import ChatPage from '../../pages/ios/ChatPage';
import EulaPage from '../../pages/ios/EulaPage';
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

    // Wait for login to complete - the Save Password dialog may appear but we let it timeout
    // Don't click any buttons as that can interfere with the login flow
    await driver.pause(8000);

    // Check if login succeeded - either login screen is gone OR we're past it to EULA/main app
    // The login screen elements may still be in DOM but not visible
    let loginGone = false;
    try {
        const usernameField = await $('~usernameField');
        const isVisible = await usernameField.isDisplayed().catch(() => false);
        loginGone = !isVisible;
        if (!loginGone) {
            console.log('Login screen still visible after wait');
        }
    } catch {
        loginGone = true;
    }

    if (!loginGone) {
        // Try one more time with longer wait - maybe dialog needs more time
        await driver.pause(5000);
        try {
            const usernameField = await $('~usernameField');
            loginGone = !(await usernameField.isDisplayed().catch(() => false));
        } catch {
            loginGone = true;
        }
    }

    if (!loginGone) {
        const screenshot = await driver.takeScreenshot();
        console.log('Login screen still displayed, screenshot:', screenshot.substring(0, 100) + '...');
        throw new Error('Login failed - still on login screen');
    }

    console.log('Login screen no longer displayed, continuing...');

    // Wait for either the main app (tab bar) or EULA button to appear
    // The app goes through: Login -> EULA check (loading) -> EULA or MainApp
    console.log('Waiting for app to finish loading after login...');

    // Wait up to 30 seconds for something to appear
    let foundMainApp = false;
    for (let attempt = 0; attempt < 15; attempt++) {
        await driver.pause(2000);

        // Check for EULA accept button (user needs to accept)
        const eulaButton = await $('~acceptEulaButton');
        const eulaVisible = await eulaButton.isDisplayed().catch(() => false);
        if (eulaVisible) {
            console.log('EULA accept button found, clicking...');
            await eulaButton.click();
            await driver.pause(3000);
            continue;
        }

        // Check for Chat tab (main app is loaded)
        // Use the SF Symbol name 'bubble.left.and.bubble.right' for the tab bar button
        const chatTab = await $('~bubble.left.and.bubble.right');
        const chatVisible = await chatTab.isDisplayed().catch(() => false);
        if (chatVisible) {
            console.log('Main app loaded, Chat tab found');
            foundMainApp = true;
            break;
        }

        // Check for Breakroom tab as alternative (SF Symbol name)
        const breakroomTab = await $('~square.grid.2x2');
        const breakroomVisible = await breakroomTab.isDisplayed().catch(() => false);
        if (breakroomVisible) {
            console.log('Main app loaded, Breakroom tab found');
            foundMainApp = true;
            break;
        }

        console.log(`Attempt ${attempt + 1}/15: No main app yet, waiting...`);
    }

    if (!foundMainApp) {
        // Debug output
        const pageSource = await driver.getPageSource();
        console.log('FINAL PAGE SOURCE:', pageSource.substring(0, 3000));
        throw new Error('Main app never loaded after login');
    }

    // Click the Chat tab (use SF Symbol name for the tab bar button)
    const chatTabButton = await $('~bubble.left.and.bubble.right');
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

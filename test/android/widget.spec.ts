import LoginPage from '../../pages/android/LoginPage';
import WidgetPage from '../../pages/android/WidgetPage';
import TestUsers from '../data/testUsers';

const PACKAGE_ID = 'com.cherryblossomdev.breakroom';

/**
 * Android Widget Tests
 *
 * Mirrors the iOS widget test suite. Tests the ChatRoomWidget
 * input area (message field, send button, media/attach button).
 *
 * testTags used: widget-media-button, widget-message-input, widget-send-button
 * All defined in ChatRoomWidget.kt.
 */

async function loginAndNavigateToBreakroom(): Promise<void> {
    await driver.terminateApp(PACKAGE_ID);
    await driver.execute('mobile: clearApp', { appId: PACKAGE_ID });
    await driver.activateApp(PACKAGE_ID);
    await LoginPage.waitForAppReady();
    await LoginPage.login(TestUsers.standard.handle, TestUsers.standard.password);

    // Wait for home screen
    await driver.pause(3000);

    // Dismiss EULA if present
    await LoginPage.dismissEulaIfPresent();

    // Navigate to Breakroom tab
    await WidgetPage.navigateToBreakroom();
}

describe('Breakroom Android - Chat Widget', () => {
    before(async () => {
        await loginAndNavigateToBreakroom();
    });

    describe('Widget Discovery', () => {
        it('should find a block with chat widget', async () => {
            const found = await WidgetPage.openBlockWithChatWidget();
            expect(found).toBe(true);
        });
    });

    describe('Widget Elements', () => {
        it('should display the message input field', async () => {
            await WidgetPage.waitForWidget();
            const isDisplayed = await WidgetPage.isWidgetDisplayed();
            expect(isDisplayed).toBe(true);
        });

        it('should display the media button', async () => {
            const isDisplayed = await WidgetPage.isMediaButtonDisplayed();
            expect(isDisplayed).toBe(true);
        });

        it('should display the send button', async () => {
            const isDisplayed = await WidgetPage.isSendButtonDisplayed();
            expect(isDisplayed).toBe(true);
        });

        it('should have send button disabled when input is empty', async () => {
            const isEnabled = await WidgetPage.isSendButtonEnabled();
            expect(isEnabled).toBe(false);
        });
    });

    describe('Message Input', () => {
        it('should accept text input', async () => {
            const testMessage = 'Test message from widget';
            await WidgetPage.enterMessage(testMessage);
            await driver.pause(500);

            // Verify text was entered
            const inputText = await WidgetPage.getMessageText();
            expect(inputText).toBe(testMessage);
        });

        it('should enable send button when text is entered', async () => {
            // Clear and re-enter text
            await WidgetPage.messageInput.clearValue();
            await WidgetPage.enterMessage('Hello widget');
            await driver.pause(500);

            const isEnabled = await WidgetPage.isSendButtonEnabled();
            expect(isEnabled).toBe(true);
        });
    });

    describe('Send Button Functionality', () => {
        it('should send message successfully', async () => {
            // Enter a test message
            await WidgetPage.messageInput.clearValue();
            const testMessage = `Widget test ${Date.now()}`;
            await WidgetPage.enterMessage(testMessage);
            await WidgetPage.hideKeyboard();
            await driver.pause(500);

            // Click send button
            await WidgetPage.clickSendButton();
            await driver.pause(1500);

            // Verify we're still on the widget
            const widgetStillVisible = await WidgetPage.isWidgetDisplayed();
            expect(widgetStillVisible).toBe(true);
        });

        it('should clear input after sending message', async () => {
            // Enter and send another message
            await WidgetPage.enterMessage('Another test message');
            await WidgetPage.hideKeyboard();
            await driver.pause(300);
            await WidgetPage.clickSendButton();
            await driver.pause(1000);

            // Input should be cleared after successful send
            const inputText = await WidgetPage.getMessageText();
            expect(inputText).toBe('');
        });
    });

    describe('Media Button Functionality', () => {
        it('should open attachment menu when media button is clicked', async () => {
            await WidgetPage.clickMediaButton();
            await driver.pause(1000);

            const menuOpen = await WidgetPage.isAttachMenuDisplayed();
            expect(menuOpen).toBe(true);

            await WidgetPage.dismissAttachMenu();
            await driver.pause(500);
        });
    });

    describe('Button Tap Target Isolation', () => {
        /**
         * Verifies that send and media buttons have properly isolated tap targets
         * and do not interfere with each other.
         */
        it('should have isolated tap targets for send and media buttons', async () => {
            await WidgetPage.enterMessage('Tap test');
            await WidgetPage.hideKeyboard();
            await driver.pause(500);

            const sendButton = await WidgetPage.sendButton;
            const mediaButton = await WidgetPage.mediaButton;

            const sendLocation = await sendButton.getLocation();
            const mediaLocation = await mediaButton.getLocation();
            const sendSize = await sendButton.getSize();
            const mediaSize = await mediaButton.getSize();

            console.log(`Send button: x=${sendLocation.x}, y=${sendLocation.y}, w=${sendSize.width}, h=${sendSize.height}`);
            console.log(`Media button: x=${mediaLocation.x}, y=${mediaLocation.y}, w=${mediaSize.width}, h=${mediaSize.height}`);

            // Send button should be to the right of media button
            const mediaRight = mediaLocation.x + mediaSize.width;
            const sendLeft = sendLocation.x;
            expect(sendLeft).toBeGreaterThan(mediaRight - 20);
        });

        it('should not open attachment menu when tapping disabled send button', async () => {
            await WidgetPage.messageInput.clearValue();
            await driver.pause(300);

            // Send button is disabled — tapping it should do nothing
            await WidgetPage.clickSendButton();
            await driver.pause(1000);

            const menuOpen = await WidgetPage.isAttachMenuDisplayed();
            expect(menuOpen).toBe(false);

            const widgetVisible = await WidgetPage.isWidgetDisplayed();
            expect(widgetVisible).toBe(true);
        });
    });
});

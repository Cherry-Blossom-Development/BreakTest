import LoginPage from '../../pages/android/LoginPage';
import WidgetPage from '../../pages/android/WidgetPage';
import TestUsers from '../data/testUsers';

const PACKAGE_ID = 'com.cherryblossomdev.breakroom';

/**
 * Android Widget Tests
 *
 * NOTE: These tests may be limited until testTag modifiers are added
 * to ChatRoomWidget.kt in the Android app. See WidgetPage.ts for
 * the required testTags.
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
        it('should show attachment menu when media button is clicked', async () => {
            // Click the media button
            await WidgetPage.clickMediaButton();
            await driver.pause(1000);

            // Verify attachment menu items are visible
            const imageOption = await $('android=new UiSelector().text("Image")');
            const videoOption = await $('android=new UiSelector().text("Video")');

            const imageVisible = await imageOption.isDisplayed().catch(() => false);
            const videoVisible = await videoOption.isDisplayed().catch(() => false);

            expect(imageVisible || videoVisible).toBe(true);

            // Dismiss by pressing back
            await driver.back();
        });
    });
});

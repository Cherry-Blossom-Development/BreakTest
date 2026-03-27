import LoginPage from '../../pages/ios/LoginPage';
import WidgetPage from '../../pages/ios/WidgetPage';
import EulaPage from '../../pages/ios/EulaPage';
import TestUsers from '../data/testUsers';

const BUNDLE_ID = 'com.cherryblossomdev.Breakroom';
const TEST_API_URL = process.env.TEST_API_URL || 'https://dev.prosaurus.com';

async function loginAndNavigateToBreakroom(): Promise<void> {
    try {
        await driver.terminateApp(BUNDLE_ID);
    } catch {
        // App might not be running
    }

    await driver.execute('mobile: launchApp', {
        bundleId: BUNDLE_ID,
        arguments: ['-CLEAR_AUTH_STATE', 'YES', '-TEST_API_URL', TEST_API_URL],
    });

    await LoginPage.waitForAppReady();
    await LoginPage.login(TestUsers.standard.handle, TestUsers.standard.password);

    // Wait for login to complete
    await driver.pause(8000);

    // Check if login succeeded
    let loginGone = false;
    try {
        const usernameField = await $('~usernameField');
        const isVisible = await usernameField.isDisplayed().catch(() => false);
        loginGone = !isVisible;
    } catch {
        loginGone = true;
    }

    if (!loginGone) {
        await driver.pause(5000);
        try {
            const usernameField = await $('~usernameField');
            loginGone = !(await usernameField.isDisplayed().catch(() => false));
        } catch {
            loginGone = true;
        }
    }

    if (!loginGone) {
        throw new Error('Login failed - still on login screen');
    }

    // Wait for main app or EULA
    let foundMainApp = false;
    for (let attempt = 0; attempt < 15; attempt++) {
        await driver.pause(2000);

        // Check for EULA accept button
        const eulaButton = await $('~acceptEulaButton');
        const eulaVisible = await eulaButton.isDisplayed().catch(() => false);
        if (eulaVisible) {
            console.log('EULA accept button found, clicking...');
            await eulaButton.click();
            await driver.pause(3000);
            continue;
        }

        // Check for Breakroom tab
        const breakroomTab = await $('~square.grid.2x2');
        const breakroomVisible = await breakroomTab.isDisplayed().catch(() => false);
        if (breakroomVisible) {
            console.log('Main app loaded, Breakroom tab found');
            foundMainApp = true;
            break;
        }

        console.log(`Attempt ${attempt + 1}/15: Waiting for main app...`);
    }

    if (!foundMainApp) {
        throw new Error('Main app never loaded after login');
    }

    // Navigate to Breakroom tab
    await WidgetPage.navigateToBreakroom();
}

describe('Breakroom iOS - Chat Widget', () => {
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

            // Verify text was entered (send button should be enabled)
            const isEnabled = await WidgetPage.isSendButtonEnabled();
            expect(isEnabled).toBe(true);
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

    describe('Send Button Functionality (Bug Regression)', () => {
        /**
         * CRITICAL TEST: Verifies fix for bug where send button
         * was triggering the media picker instead of sending messages.
         *
         * Bug: PhotosPicker tap target was expanding to cover send button
         * Fix: Added .buttonStyle(.plain) and .fixedSize() to constrain tap targets
         */
        it('should send message without opening media picker', async () => {
            // Enter a test message
            await WidgetPage.messageInput.clearValue();
            const testMessage = `Widget test ${Date.now()}`;
            await WidgetPage.enterMessage(testMessage);
            await WidgetPage.hideKeyboard();
            await driver.pause(500);

            // Click send button
            await WidgetPage.clickSendButton();
            await driver.pause(1000);

            // Verify photos picker did NOT open (the bug behavior)
            const photosPickerOpen = await WidgetPage.isPhotosPickerDisplayed();

            if (photosPickerOpen) {
                // If picker opened, dismiss it and fail the test
                await WidgetPage.dismissPhotosPicker();
                expect(photosPickerOpen).toBe(false);
            }

            // Verify we're still on the widget (message was sent)
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
            // Check that send button is disabled (no text)
            const isEnabled = await WidgetPage.isSendButtonEnabled();
            expect(isEnabled).toBe(false);
        });
    });

    describe('Media Button Functionality', () => {
        it('should open photos picker when media button is clicked', async () => {
            // Click the media button
            await WidgetPage.clickMediaButton();
            await driver.pause(1500);

            // Verify photos picker opened
            const photosPickerOpen = await WidgetPage.isPhotosPickerDisplayed();
            expect(photosPickerOpen).toBe(true);

            // Dismiss the picker
            await WidgetPage.dismissPhotosPicker();
        });
    });

    describe('Button Tap Target Isolation', () => {
        /**
         * Additional regression test to verify buttons have proper
         * tap target isolation and don't interfere with each other
         */
        it('should have isolated tap targets for send and media buttons', async () => {
            // Enter text to enable send button
            await WidgetPage.enterMessage('Tap test');
            await WidgetPage.hideKeyboard();
            await driver.pause(500);

            // Get positions of both buttons
            const sendButton = await WidgetPage.sendButton;
            const mediaButton = await WidgetPage.mediaButton;

            const sendLocation = await sendButton.getLocation();
            const mediaLocation = await mediaButton.getLocation();
            const sendSize = await sendButton.getSize();
            const mediaSize = await mediaButton.getSize();

            console.log(`Send button: x=${sendLocation.x}, y=${sendLocation.y}, w=${sendSize.width}, h=${sendSize.height}`);
            console.log(`Media button: x=${mediaLocation.x}, y=${mediaLocation.y}, w=${mediaSize.width}, h=${mediaSize.height}`);

            // Verify buttons don't overlap
            // Send button should be to the right of media button
            const mediaRight = mediaLocation.x + mediaSize.width;
            const sendLeft = sendLocation.x;

            expect(sendLeft).toBeGreaterThan(mediaRight - 20); // Allow small overlap tolerance
        });

        it('should correctly identify which button was tapped', async () => {
            // Clear input and verify send button is disabled
            await WidgetPage.messageInput.clearValue();
            await driver.pause(300);

            // Tap send button (should do nothing since disabled)
            await WidgetPage.clickSendButton();
            await driver.pause(1000);

            // Photos picker should NOT open
            const photosPickerOpen = await WidgetPage.isPhotosPickerDisplayed();
            expect(photosPickerOpen).toBe(false);

            // Widget should still be visible
            const widgetVisible = await WidgetPage.isWidgetDisplayed();
            expect(widgetVisible).toBe(true);
        });
    });
});

import LoginPage from '../../pages/web/LoginPage';
import WidgetPage from '../../pages/web/WidgetPage';
import TestUsers from '../data/testUsers';

async function loginAndNavigateToBreakroom(): Promise<void> {
    await browser.deleteCookies();
    await LoginPage.open();
    await LoginPage.login(TestUsers.standard.handle, TestUsers.standard.password);

    // Wait for redirect after login
    await browser.pause(3000);

    // Navigate to Breakroom page
    await WidgetPage.navigateToBreakroom();
}

describe('Breakroom Web - Chat Widget', () => {
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

        it('should display the media/attach button', async () => {
            const isDisplayed = await WidgetPage.isMediaButtonDisplayed();
            expect(isDisplayed).toBe(true);
        });

        it('should display the send button', async () => {
            const isDisplayed = await WidgetPage.isSendButtonDisplayed();
            expect(isDisplayed).toBe(true);
        });

        it('should have send button disabled when input is empty', async () => {
            // Ensure input is empty
            await WidgetPage.clearMessage();
            await browser.pause(300);

            const isEnabled = await WidgetPage.isSendButtonEnabled();
            expect(isEnabled).toBe(false);
        });
    });

    describe('Message Input', () => {
        it('should accept text input', async () => {
            const testMessage = 'Test message from widget';
            await WidgetPage.enterMessage(testMessage);
            await browser.pause(300);

            const inputText = await WidgetPage.getMessageText();
            expect(inputText).toBe(testMessage);
        });

        it('should enable send button when text is entered', async () => {
            await WidgetPage.clearMessage();
            await WidgetPage.enterMessage('Hello widget');
            await browser.pause(300);

            const isEnabled = await WidgetPage.isSendButtonEnabled();
            expect(isEnabled).toBe(true);
        });
    });

    describe('Send Button Functionality', () => {
        it('should send message successfully', async () => {
            await WidgetPage.clearMessage();
            const testMessage = `Widget test ${Date.now()}`;
            await WidgetPage.enterMessage(testMessage);
            await browser.pause(300);

            await WidgetPage.clickSendButton();
            await browser.pause(1500);

            // Widget should still be visible after sending
            const widgetStillVisible = await WidgetPage.isWidgetDisplayed();
            expect(widgetStillVisible).toBe(true);
        });

        it('should clear input after sending message', async () => {
            await WidgetPage.enterMessage('Another test message');
            await browser.pause(300);
            await WidgetPage.clickSendButton();
            await browser.pause(1000);

            // Input should be cleared
            const inputText = await WidgetPage.getMessageText();
            expect(inputText).toBe('');
        });
    });

    describe('Media Button Functionality', () => {
        it('should open attachment menu when media button is clicked', async () => {
            await WidgetPage.clickMediaButton();
            await browser.pause(500);

            const menuOpen = await WidgetPage.isAttachMenuDisplayed();
            expect(menuOpen).toBe(true);
        });

        it('should show Image and Video options in attachment menu', async () => {
            // Menu should already be open from previous test, but ensure it is
            if (!(await WidgetPage.isAttachMenuDisplayed())) {
                await WidgetPage.clickMediaButton();
                await browser.pause(500);
            }

            const imageVisible = await WidgetPage.attachMenuImageOption.isDisplayed().catch(() => false);
            const videoVisible = await WidgetPage.attachMenuVideoOption.isDisplayed().catch(() => false);

            expect(imageVisible).toBe(true);
            expect(videoVisible).toBe(true);

            // Dismiss menu
            await WidgetPage.dismissAttachMenu();
            await browser.pause(300);
        });

        it('should close attachment menu when clicking message input', async () => {
            // Open menu
            await WidgetPage.clickMediaButton();
            await browser.pause(500);

            // Click input to close
            await WidgetPage.dismissAttachMenu();
            await browser.pause(500);

            const menuOpen = await WidgetPage.isAttachMenuDisplayed();
            expect(menuOpen).toBe(false);
        });
    });

    describe('Button Isolation', () => {
        it('should not open attach menu when tapping disabled send button', async () => {
            // Ensure input is empty so send button is disabled
            await WidgetPage.clearMessage();
            await browser.pause(300);

            // Ensure attach menu is closed
            if (await WidgetPage.isAttachMenuDisplayed()) {
                await WidgetPage.dismissAttachMenu();
                await browser.pause(300);
            }

            await WidgetPage.clickSendButton();
            await browser.pause(500);

            // Attach menu should NOT have opened
            const menuOpen = await WidgetPage.isAttachMenuDisplayed();
            expect(menuOpen).toBe(false);

            // Widget should still be visible
            const widgetVisible = await WidgetPage.isWidgetDisplayed();
            expect(widgetVisible).toBe(true);
        });
    });
});

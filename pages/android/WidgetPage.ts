import BasePage from './BasePage';

/**
 * Page object for Chat Widget within Breakroom blocks (Android)
 *
 * NOTE: The Android ChatRoomWidget currently lacks testTag modifiers.
 * This page object uses UI Automator selectors as fallback until
 * testTags are added to the Android app.
 *
 * TODO: Add these testTags to ChatRoomWidget.kt:
 *   - Modifier.testTag("widget-media-button") on attach IconButton
 *   - Modifier.testTag("widget-message-input") on OutlinedTextField
 *   - Modifier.testTag("widget-send-button") on send IconButton
 */
class WidgetPage extends BasePage {
    // Widget chat elements (using content descriptions as fallback)
    get mediaButton() {
        return $('android=new UiSelector().description("Attach")');
    }

    get messageInput() {
        return $('android=new UiSelector().className("android.widget.EditText")');
    }

    get sendButton() {
        return $('android=new UiSelector().description("Send")');
    }

    // Navigation tab
    get breakroomTab() {
        return this.rid('nav-breakroom');
    }

    async navigateToBreakroom(): Promise<void> {
        await this.breakroomTab.click();
        await driver.pause(2000);
    }

    async waitForWidget(timeout = 30000): Promise<void> {
        await this.messageInput.waitForDisplayed({ timeout });
    }

    async isWidgetDisplayed(): Promise<boolean> {
        try {
            return await this.messageInput.isDisplayed();
        } catch {
            return false;
        }
    }

    async isMediaButtonDisplayed(): Promise<boolean> {
        try {
            return await this.mediaButton.isDisplayed();
        } catch {
            return false;
        }
    }

    async isSendButtonDisplayed(): Promise<boolean> {
        try {
            return await this.sendButton.isDisplayed();
        } catch {
            return false;
        }
    }

    async isSendButtonEnabled(): Promise<boolean> {
        try {
            return await this.sendButton.isEnabled();
        } catch {
            return false;
        }
    }

    async enterMessage(text: string): Promise<void> {
        await this.messageInput.setValue(text);
    }

    async getMessageText(): Promise<string> {
        try {
            return await this.messageInput.getText();
        } catch {
            return '';
        }
    }

    async clickSendButton(): Promise<void> {
        await this.sendButton.click();
    }

    async clickMediaButton(): Promise<void> {
        await this.mediaButton.click();
    }

    /**
     * Send a message via the widget
     * @param text - message to send
     */
    async sendMessage(text: string): Promise<void> {
        await this.enterMessage(text);
        await this.hideKeyboard();
        await this.clickSendButton();
    }

    /**
     * Find and scroll to a block with a chat widget
     */
    async openBlockWithChatWidget(): Promise<boolean> {
        for (let attempt = 0; attempt < 5; attempt++) {
            const isVisible = await this.isWidgetDisplayed();
            if (isVisible) {
                return true;
            }

            // Scroll down to reveal more content
            const { width, height } = await driver.getWindowSize();
            await driver.touchAction([
                { action: 'press', x: width / 2, y: height * 0.7 },
                { action: 'wait', ms: 300 },
                { action: 'moveTo', x: width / 2, y: height * 0.3 },
                { action: 'release' },
            ]);
            await driver.pause(1000);
        }

        return await this.isWidgetDisplayed();
    }
}

export default new WidgetPage();

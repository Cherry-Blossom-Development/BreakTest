import BasePage from './BasePage';

/**
 * Page object for Chat Widget within Breakroom blocks (Android)
 */
class WidgetPage extends BasePage {
    // Widget chat elements (testTags set in ChatRoomWidget.kt)
    get mediaButton() {
        return this.rid('widget-media-button');
    }

    get messageInput() {
        return this.rid('widget-message-input');
    }

    get sendButton() {
        return this.rid('widget-send-button');
    }

    // Navigation tab — route is "home", tag is "nav-home"
    get breakroomTab() {
        return this.rid('nav-home');
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
     * Check if the attachment dropdown menu is displayed.
     * Android shows a DropdownMenu with "Image" and "Video" options.
     */
    async isAttachMenuDisplayed(): Promise<boolean> {
        try {
            const imageOption = await $('android=new UiSelector().text("Image")');
            return await imageOption.isDisplayed().catch(() => false);
        } catch {
            return false;
        }
    }

    /**
     * Dismiss the attachment dropdown menu by pressing back
     */
    async dismissAttachMenu(): Promise<void> {
        try {
            await driver.back();
            await driver.pause(300);
        } catch {
            // Menu might not be open
        }
    }

    /**
     * Find and scroll to a block with a chat widget.
     * Scrolls down up to 5 times looking for the widget message input.
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

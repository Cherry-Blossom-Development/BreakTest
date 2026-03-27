import BasePage from './BasePage';

/**
 * Page object for Chat Widget within Breakroom blocks
 */
class WidgetPage extends BasePage {
    // Widget chat elements
    get mediaButton() {
        return this.aid('widgetMediaButton');
    }

    get messageInput() {
        return this.aid('widgetMessageInput');
    }

    get sendButton() {
        return this.aid('widgetSendButton');
    }

    // Breakroom tab navigation
    get breakroomTab() {
        return this.aid('square.grid.2x2');
    }

    // Block items in breakroom
    get blockItems() {
        return this.aids('breakroomBlock');
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
     * Check if photos picker is displayed (indicating media button was triggered)
     * This is used to verify the send button bug is fixed
     */
    async isPhotosPickerDisplayed(): Promise<boolean> {
        try {
            // Look for iOS photos picker elements
            const photosNav = await $('//XCUIElementTypeNavigationBar[@name="Photos"]');
            return await photosNav.isDisplayed().catch(() => false);
        } catch {
            return false;
        }
    }

    /**
     * Dismiss the photos picker if open
     */
    async dismissPhotosPicker(): Promise<void> {
        try {
            const cancelButton = await $('//XCUIElementTypeButton[@name="Cancel"]');
            if (await cancelButton.isDisplayed().catch(() => false)) {
                await cancelButton.click();
                await driver.pause(500);
            }
        } catch {
            // Picker might not be open
        }
    }

    /**
     * Get count of blocks in breakroom
     */
    async getBlockCount(): Promise<number> {
        try {
            const blocks = await this.blockItems;
            return blocks.length;
        } catch {
            return 0;
        }
    }

    /**
     * Find and tap a block with a chat widget
     * Scrolls through blocks to find one with the widget
     */
    async openBlockWithChatWidget(): Promise<boolean> {
        // Scroll down to find blocks with chat widgets
        for (let attempt = 0; attempt < 5; attempt++) {
            // Check if widget is already visible
            const isVisible = await this.isWidgetDisplayed();
            if (isVisible) {
                return true;
            }

            // Scroll down to reveal more content using mobile: scroll
            await driver.execute('mobile: scroll', { direction: 'down' });
            await driver.pause(1000);
        }

        return await this.isWidgetDisplayed();
    }
}

export default new WidgetPage();

/**
 * Chat Page for iOS Demo Scripts
 *
 * Handles chat screen interactions.
 */

import BasePage from './BasePage';

class ChatPage extends BasePage {
    /**
     * Page elements - using accessibility identifiers
     */
    get messageInput() {
        return $('~messageInput');
    }

    get sendButton() {
        return $('~sendButton');
    }

    get messagesList() {
        return $('-ios predicate string:type == "XCUIElementTypeScrollView"');
    }

    get roomTitle() {
        // Room title starts with "# "
        return $('-ios predicate string:type == "XCUIElementTypeStaticText" AND label BEGINSWITH "# "');
    }

    get backButton() {
        return $('-ios predicate string:type == "XCUIElementTypeButton" AND label == "Back"');
    }

    /**
     * Get all message cells (static text elements that could be messages)
     */
    get messageCells() {
        return $$('-ios predicate string:type == "XCUIElementTypeStaticText"');
    }

    /**
     * Wait for chat screen to be visible
     */
    async waitForScreen(timeout: number = 10000): Promise<void> {
        // Wait for the message input or room title
        try {
            await this.messageInput.waitForDisplayed({ timeout });
        } catch {
            await this.roomTitle.waitForDisplayed({ timeout });
        }
    }

    /**
     * Check if chat screen is displayed
     */
    async isDisplayed(): Promise<boolean> {
        try {
            return await this.roomTitle.isDisplayed();
        } catch {
            return false;
        }
    }

    /**
     * Type a message into the input field
     */
    async typeMessage(message: string): Promise<void> {
        await this.messageInput.waitForDisplayed();
        await this.messageInput.click();
        await this.naturalPause(200);
        await this.messageInput.setValue(message);
    }

    /**
     * Type a message with natural-looking typing (for demos)
     */
    async typeMessageNaturally(message: string): Promise<void> {
        await this.messageInput.waitForDisplayed();
        await this.typeSlowly(this.messageInput, message, 60);
    }

    /**
     * Send the currently typed message
     */
    async sendMessage(): Promise<void> {
        await this.sendButton.click();
        await this.naturalPause(500);
    }

    /**
     * Type and send a message in one action
     */
    async sendNewMessage(message: string): Promise<void> {
        await this.typeMessage(message);
        await this.naturalPause(300);
        await this.sendMessage();
    }

    /**
     * Type and send a message with natural typing
     */
    async sendNewMessageNaturally(message: string): Promise<void> {
        await this.typeMessageNaturally(message);
        await this.naturalPause(500);
        await this.sendMessage();
    }

    /**
     * Type and send a message quickly (for 30-second demos)
     */
    async sendNewMessageFast(message: string): Promise<void> {
        await this.messageInput.waitForDisplayed();
        await this.typeSlowly(this.messageInput, message, 20);
        await browser.pause(200);
        await this.sendMessage();
    }

    /**
     * Get the number of visible messages
     */
    async getMessageCount(): Promise<number> {
        const messages = await this.messageCells;
        return messages.length;
    }

    /**
     * Get the text of the last message
     */
    async getLastMessageText(): Promise<string> {
        const messages = await this.messageCells;
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            return await lastMessage.getText();
        }
        return '';
    }

    /**
     * Scroll to see older messages
     */
    async scrollToOlderMessages(): Promise<void> {
        await this.scrollDown();
        await this.naturalPause(500);
    }

    /**
     * Scroll to see newer messages (bottom)
     */
    async scrollToNewerMessages(): Promise<void> {
        await this.scrollUp();
        await this.naturalPause(500);
    }

    /**
     * Refresh messages (pull to refresh)
     */
    async refreshMessages(waitMs: number = 500): Promise<void> {
        await this.pullToRefresh(waitMs);
    }

    /**
     * Go back to previous screen
     */
    async goBack(): Promise<void> {
        if (await this.backButton.isExisting()) {
            await this.tapWithPause(this.backButton, 500);
        } else {
            await super.goBack();
        }
    }

    /**
     * Get the current room title
     */
    async getRoomTitle(): Promise<string> {
        if (await this.roomTitle.isExisting()) {
            return await this.roomTitle.getText();
        }
        return '';
    }

    /**
     * Wait for a new message to appear
     * (useful after external user sends a message)
     */
    async waitForNewMessage(
        initialCount: number,
        timeout: number = 5000
    ): Promise<boolean> {
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            const currentCount = await this.getMessageCount();
            if (currentCount > initialCount) {
                return true;
            }
            await browser.pause(500);
        }

        return false;
    }
}

export default new ChatPage();

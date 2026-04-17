import BasePage from './BasePage';

/**
 * Page object for the Chat page
 */
class ChatPage extends BasePage {
    /**
     * Selectors for page elements
     */
    get messageInput() {
        return $('input[type="text"][placeholder*="message"], textarea[placeholder*="message"], input[name="message"], textarea[name="message"]');
    }

    get sendButton() {
        return $('button[type="submit"], button[aria-label*="send"], button[class*="send"]');
    }

    get messageList() {
        return $('[class*="message-list"], [class*="messages"], [class*="chat-messages"]');
    }

    get messages() {
        return $$('[class*="message"]:not([class*="message-list"]):not([class*="messages"])');
    }

    get chatContainer() {
        return $('[class*="chat"], [class*="breakroom"]');
    }

    get userList() {
        return $('[class*="user-list"], [class*="participants"], [class*="members"]');
    }

    get typingIndicator() {
        return $('[class*="typing"]');
    }

    /**
     * Opens the chat/breakroom page
     */
    async open(): Promise<void> {
        await super.open('/breakroom');
    }

    /**
     * Sends a message in the chat
     * @param message - The message to send
     */
    async sendMessage(message: string): Promise<void> {
        await this.messageInput.waitForExist();
        await this.messageInput.waitForClickable({ timeout: 10000 });
        await this.messageInput.setValue(message);
        await this.sendButton.waitForClickable({ timeout: 10000 });
        await this.sendButton.click();
    }

    /**
     * Gets the text of the last message in the chat
     */
    async getLastMessageText(): Promise<string> {
        const allMessages = await this.messages;
        if (allMessages.length === 0) {
            return '';
        }
        const lastMessage = allMessages[allMessages.length - 1];
        return lastMessage.getText();
    }

    /**
     * Gets the count of messages displayed
     */
    async getMessageCount(): Promise<number> {
        const allMessages = await this.messages;
        return allMessages.length;
    }

    /**
     * Checks if the chat interface is displayed
     */
    async isDisplayed(): Promise<boolean> {
        return this.chatContainer.isDisplayed();
    }

    /**
     * Waits for a new message to appear
     * @param initialCount - The message count before the new message
     * @param timeout - Optional timeout in ms
     */
    async waitForNewMessage(initialCount: number, timeout = 10000): Promise<void> {
        await browser.waitUntil(
            async () => {
                const currentCount = await this.getMessageCount();
                return currentCount > initialCount;
            },
            { timeout, timeoutMsg: 'New message did not appear within timeout' }
        );
    }

    /**
     * Checks if the message input is enabled
     */
    async isMessageInputEnabled(): Promise<boolean> {
        return this.messageInput.isEnabled();
    }

    /**
     * Clears the message input field
     */
    async clearMessageInput(): Promise<void> {
        await this.messageInput.clearValue();
    }

    /**
     * Selects a chat room by name in the sidebar room list.
     * The sidebar room list is only visible when on the /chat page.
     * @param roomName - The display name of the room (without the '#' prefix)
     */
    async selectRoom(roomName: string): Promise<void> {
        const roomItems = await $$('.room-item');
        for (const item of roomItems) {
            const nameEl = await item.$('.room-name');
            if (await nameEl.isExisting()) {
                const text = await nameEl.getText();
                if (text.includes(roomName)) {
                    await item.click();
                    return;
                }
            }
        }
        throw new Error(`Room "${roomName}" not found in sidebar`);
    }

    /**
     * Returns the unread badge element for a specific room in the sidebar.
     * The badge is only present in the DOM when the room has unread messages.
     * Must be on the /chat page for the sidebar room list to be visible.
     * @param roomName - The display name of the room (without the '#' prefix)
     */
    async getRoomBadge(roomName: string) {
        const roomItems = await $$('.room-item');
        for (const item of roomItems) {
            const nameEl = await item.$('.room-name');
            if (await nameEl.isExisting()) {
                const text = await nameEl.getText();
                if (text.includes(roomName)) {
                    return item.$('.room-badge');
                }
            }
        }
        throw new Error(`Room "${roomName}" not found in sidebar`);
    }
}

export default new ChatPage();

import BasePage from './BasePage';

class ChatPage extends BasePage {
    get roomItems() {
        return this.aids('roomItem');
    }

    get messageInput() {
        return this.aid('messageInput');
    }

    get sendButton() {
        return this.aid('sendButton');
    }

    get chatTab() {
        // Use the SF Symbol name for the tab bar button
        return this.aid('bubble.left.and.bubble.right');
    }

    async waitForRoomList(timeout = 30000): Promise<void> {
        // Wait for at least one room item to appear
        const items = await this.roomItems;
        if (items.length > 0) {
            await items[0].waitForDisplayed({ timeout });
        } else {
            // Wait a bit for the list to load
            await driver.pause(3000);
        }
    }

    async waitForChatRoom(timeout = 30000): Promise<void> {
        await this.messageInput.waitForDisplayed({ timeout });
    }

    async isRoomListDisplayed(): Promise<boolean> {
        try {
            const items = await this.roomItems;
            return items.length > 0;
        } catch {
            return false;
        }
    }

    async isChatRoomDisplayed(): Promise<boolean> {
        try {
            return await this.messageInput.isDisplayed();
        } catch {
            return false;
        }
    }

    async getRoomCount(): Promise<number> {
        try {
            const items = await this.roomItems;
            return items.length;
        } catch {
            return 0;
        }
    }

    async openFirstRoom(): Promise<void> {
        const items = await this.roomItems;
        if (items.length === 0) throw new Error('No rooms found');
        await items[0].click();
    }

    async sendMessage(text: string): Promise<void> {
        await this.waitForChatRoom();
        await this.messageInput.setValue(text);
        await this.hideKeyboard();
        await this.sendButton.click();
    }

    async isMessageInputDisplayed(): Promise<boolean> {
        try {
            return await this.messageInput.isDisplayed();
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

    async navigateToChatTab(): Promise<void> {
        await this.chatTab.click();
    }
}

export default new ChatPage();

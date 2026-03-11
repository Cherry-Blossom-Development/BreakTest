import BasePage from './BasePage';

class ChatPage extends BasePage {
    get roomList() {
        return this.rid('room-list');
    }

    get roomItems() {
        return this.rids('room-item');
    }

    get messageInput() {
        return this.rid('message-input');
    }

    get sendButton() {
        return this.rid('send-button');
    }

    get messageList() {
        return this.rid('message-list');
    }

    async waitForRoomList(timeout = 30000): Promise<void> {
        await this.roomList.waitForDisplayed({ timeout });
    }

    async waitForChatRoom(timeout = 30000): Promise<void> {
        await this.messageInput.waitForDisplayed({ timeout });
    }

    async isRoomListDisplayed(): Promise<boolean> {
        try {
            return await this.roomList.isDisplayed();
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
}

export default new ChatPage();

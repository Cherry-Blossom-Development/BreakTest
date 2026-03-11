import LoginPage from '../../pages/android/LoginPage';
import ChatPage from '../../pages/android/ChatPage';
import TestUsers from '../data/testUsers';

async function loginAndNavigateToChat(): Promise<void> {
    await driver.terminateApp('com.cherryblossomdev.breakroom');
    await driver.activateApp('com.cherryblossomdev.breakroom');
    await LoginPage.waitForAppReady();
    await LoginPage.login(TestUsers.standard.handle, TestUsers.standard.password);

    // Wait for home screen, then tap the Chat tab
    await driver.pause(3000);
    const chatTab = await $('~Chat');
    await chatTab.waitForDisplayed({ timeout: 10000 });
    await chatTab.click();
}

describe('Breakroom Android - Chat', () => {
    before(async () => {
        await loginAndNavigateToChat();
    });

    it('should display the room list', async () => {
        await ChatPage.waitForRoomList();
        const isDisplayed = await ChatPage.isRoomListDisplayed();
        expect(isDisplayed).toBe(true);
    });

    it('should have at least one room', async () => {
        await ChatPage.waitForRoomList();
        const count = await ChatPage.getRoomCount();
        expect(count).toBeGreaterThan(0);
    });

    it('should open a chat room', async () => {
        await ChatPage.waitForRoomList();
        await ChatPage.openFirstRoom();

        await driver.pause(2000);

        const isChatDisplayed = await ChatPage.isChatRoomDisplayed();
        expect(isChatDisplayed).toBe(true);
    });

    it('should display the message input field', async () => {
        await ChatPage.waitForChatRoom();
        await expect(ChatPage.messageInput).toBeDisplayed();
    });

    it('should display the send button', async () => {
        await ChatPage.waitForChatRoom();
        await expect(ChatPage.sendButton).toBeDisplayed();
    });

    it('should send a message successfully', async () => {
        await ChatPage.waitForChatRoom();
        await ChatPage.sendMessage('Hello from BreakTest Android');

        await driver.pause(3000);

        // After sending, input should be cleared
        const inputText = await ChatPage.messageInput.getText();
        expect(inputText).toBe('');
    });

    it('should display the message list', async () => {
        await ChatPage.waitForChatRoom();
        await expect(ChatPage.messageList).toBeDisplayed();
    });
});

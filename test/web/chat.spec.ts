import LoginPage from '../../pages/web/LoginPage';
import ChatPage from '../../pages/web/ChatPage';
import TestUsers from '../data/testUsers';

describe('Breakroom Web - Chat', () => {
    before(async () => {
        // Login before running chat tests
        await LoginPage.open();
        await LoginPage.login(TestUsers.standard.handle, TestUsers.standard.password);

        // Wait for redirect after successful login
        await browser.pause(3000);
    });

    beforeEach(async () => {
        await ChatPage.open();
    });

    it('should display the chat interface', async () => {
        // Wait for the chat container to be present
        await ChatPage.chatContainer.waitForExist({ timeout: 10000 });

        // Verify chat elements exist
        expect(await ChatPage.chatContainer.isExisting()).toBe(true);
    });

    it('should display the message input field', async () => {
        await ChatPage.messageInput.waitForExist({ timeout: 10000 });

        expect(await ChatPage.messageInput.isExisting()).toBe(true);
        expect(await ChatPage.isMessageInputEnabled()).toBe(true);
    });

    it('should display the send button', async () => {
        await ChatPage.sendButton.waitForExist({ timeout: 10000 });

        expect(await ChatPage.sendButton.isExisting()).toBe(true);
    });

    it('should send a message successfully', async () => {
        await ChatPage.messageInput.waitForExist({ timeout: 10000 });

        const initialCount = await ChatPage.getMessageCount();
        const testMessage = `Test message ${Date.now()}`;

        await ChatPage.sendMessage(testMessage);

        // Wait for message to appear
        await browser.pause(2000);

        // Verify message was sent
        const lastMessage = await ChatPage.getLastMessageText();
        expect(lastMessage).toContain(testMessage);
    });

    it('should clear the input field after sending a message', async () => {
        await ChatPage.messageInput.waitForExist({ timeout: 10000 });

        const testMessage = `Clear test ${Date.now()}`;
        await ChatPage.sendMessage(testMessage);

        await browser.pause(1000);

        // Verify input field is cleared
        const inputValue = await ChatPage.messageInput.getValue();
        expect(inputValue).toBe('');
    });

    it('should display message list area', async () => {
        await ChatPage.messageList.waitForExist({ timeout: 10000 });

        expect(await ChatPage.messageList.isExisting()).toBe(true);
    });
});

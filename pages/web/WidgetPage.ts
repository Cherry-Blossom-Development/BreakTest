import BasePage from './BasePage';

/**
 * Page object for the Chat Widget on the Breakroom page (web)
 *
 * Selectors target CSS classes defined in ChatWidget.vue.
 * The widget is rendered inside a BreakroomBlock on /breakroom.
 */
class WidgetPage extends BasePage {
    get mediaButton() {
        return $('.attach-btn');
    }

    get messageInput() {
        return $('.input-area input[type="text"]');
    }

    get sendButton() {
        return $('.send-btn');
    }

    get attachMenu() {
        return $('.attach-menu');
    }

    get attachMenuImageOption() {
        return $('.attach-option=Image');
    }

    get attachMenuVideoOption() {
        return $('.attach-option=Video');
    }

    /**
     * Navigate to /breakroom (the main Breakroom page)
     */
    async navigateToBreakroom(): Promise<void> {
        await browser.url('/breakroom');
        await browser.pause(2000);
    }

    async waitForWidget(timeout = 15000): Promise<void> {
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

    async clearMessage(): Promise<void> {
        await this.messageInput.clearValue();
    }

    async getMessageText(): Promise<string> {
        try {
            return await this.messageInput.getValue();
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

    async isAttachMenuDisplayed(): Promise<boolean> {
        try {
            return await this.attachMenu.isDisplayed();
        } catch {
            return false;
        }
    }

    /**
     * Dismiss attach menu by clicking elsewhere on the page
     */
    async dismissAttachMenu(): Promise<void> {
        try {
            await this.messageInput.click();
            await browser.pause(300);
        } catch {
            // Menu might already be closed
        }
    }

    /**
     * Send a message via the widget
     */
    async sendMessage(text: string): Promise<void> {
        await this.enterMessage(text);
        await this.clickSendButton();
    }

    /**
     * Scroll down to find the chat widget — tries up to 5 times
     */
    async openBlockWithChatWidget(): Promise<boolean> {
        for (let attempt = 0; attempt < 5; attempt++) {
            const isVisible = await this.isWidgetDisplayed();
            if (isVisible) return true;

            await browser.execute(() => window.scrollBy(0, 400));
            await browser.pause(800);
        }

        return await this.isWidgetDisplayed();
    }
}

export default new WidgetPage();

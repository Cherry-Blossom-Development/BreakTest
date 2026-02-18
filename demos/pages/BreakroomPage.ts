/**
 * Breakroom Page for iOS Demo Scripts
 *
 * Handles the main Breakroom (home) screen interactions.
 */

import BasePage from './BasePage';

class BreakroomPage extends BasePage {
    /**
     * Page elements - using text/predicate selectors for compatibility
     */
    get screenTitle() {
        // Look for "Breakroom" text in navigation bar
        return $('-ios predicate string:type == "XCUIElementTypeStaticText" AND label == "Breakroom"');
    }

    get blocksList() {
        return $('-ios predicate string:type == "XCUIElementTypeScrollView"');
    }

    get addBlockButton() {
        // Plus button in toolbar
        return $('-ios predicate string:type == "XCUIElementTypeButton" AND label == "plus"');
    }

    get refreshButton() {
        // Refresh button (arrow.clockwise)
        return $('-ios predicate string:type == "XCUIElementTypeButton" AND label == "arrow.clockwise"');
    }

    /**
     * Get a block card by its title text
     */
    blockCard(title: string) {
        return $(`-ios predicate string:type == "XCUIElementTypeStaticText" AND label == "${title}"`);
    }

    /**
     * Get the chat block (look for "Demo Team" chat)
     */
    get chatBlock() {
        return $('-ios predicate string:type == "XCUIElementTypeStaticText" AND label == "Demo Team"');
    }

    /**
     * Get the updates block
     */
    get updatesBlock() {
        return $('-ios predicate string:type == "XCUIElementTypeStaticText" AND label == "Updates"');
    }

    /**
     * Wait for Breakroom screen to be visible
     */
    async waitForScreen(timeout: number = 10000): Promise<void> {
        // Wait for either the title or the add button
        try {
            await this.screenTitle.waitForDisplayed({ timeout });
        } catch {
            // Try waiting for add button as fallback
            await this.addBlockButton.waitForDisplayed({ timeout });
        }
    }

    /**
     * Check if Breakroom screen is displayed
     */
    async isDisplayed(): Promise<boolean> {
        try {
            // Check for the "Breakroom" title or the plus button
            const titleVisible = await this.screenTitle.isDisplayed();
            if (titleVisible) return true;
            return await this.addBlockButton.isDisplayed();
        } catch {
            return false;
        }
    }

    /**
     * Tap on a block to expand it
     */
    async tapBlock(blockTitle: string): Promise<void> {
        const block = this.blockCard(blockTitle);
        await block.waitForDisplayed();
        await this.tapWithPause(block, 500);
    }

    /**
     * Tap on the chat block
     */
    async tapChatBlock(): Promise<void> {
        await this.chatBlock.waitForDisplayed();
        await this.tapWithPause(this.chatBlock, 500);
    }

    /**
     * Tap on the updates block
     */
    async tapUpdatesBlock(): Promise<void> {
        await this.updatesBlock.waitForDisplayed();
        await this.tapWithPause(this.updatesBlock, 500);
    }

    /**
     * Open the add block sheet
     */
    async openAddBlockSheet(): Promise<void> {
        await this.addBlockButton.waitForDisplayed();
        await this.tapWithPause(this.addBlockButton, 500);
    }

    /**
     * Refresh the breakroom
     */
    async refresh(): Promise<void> {
        await this.refreshButton.click();
        await this.naturalPause(1500);
    }

    /**
     * Scroll through blocks (for demo showcase)
     */
    async browseBlocks(): Promise<void> {
        await this.scrollDown();
        await this.naturalPause(1000);
        await this.scrollDown();
        await this.naturalPause(1000);
        await this.scrollUp();
        await this.naturalPause(500);
    }

    /**
     * Get the count of visible blocks
     */
    async getBlockCount(): Promise<number> {
        const blocks = await $$('[name^="blockCard_"]');
        return blocks.length;
    }

    /**
     * Navigate to full chat view from chat block
     * (assumes chat block is expanded)
     */
    async openFullChat(): Promise<void> {
        const openChatButton = await $('~openFullChatButton');
        if (await openChatButton.isExisting()) {
            await this.tapWithPause(openChatButton, 500);
        }
    }
}

export default new BreakroomPage();

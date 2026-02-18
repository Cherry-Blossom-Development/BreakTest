/**
 * Base Page for iOS Demo Scripts
 *
 * Provides common functionality for all iOS page objects.
 */

export default class BasePage {
    /**
     * Wait for the page to be fully loaded
     * Override in subclasses with specific element checks
     */
    async waitForScreen(timeout: number = 10000): Promise<void> {
        // Default implementation - subclasses should override
        await browser.pause(1000);
    }

    /**
     * Check if this page/screen is currently displayed
     */
    async isDisplayed(): Promise<boolean> {
        return true;
    }

    /**
     * Pause for a natural-feeling delay (for demo recordings)
     */
    async naturalPause(ms: number = 1500): Promise<void> {
        await browser.pause(ms);
    }

    /**
     * Tap an element with a natural delay after
     */
    async tapWithPause(element: WebdriverIO.Element, pauseMs: number = 500): Promise<void> {
        await element.click();
        await browser.pause(pauseMs);
    }

    /**
     * Type text character by character (more natural for demos)
     */
    async typeSlowly(element: WebdriverIO.Element, text: string, delayMs: number = 50): Promise<void> {
        await element.click();
        for (const char of text) {
            await element.addValue(char);
            await browser.pause(delayMs);
        }
    }

    /**
     * Scroll down on the current screen
     */
    async scrollDown(): Promise<void> {
        const { height, width } = await browser.getWindowSize();
        await browser.action('pointer')
            .move({ x: Math.floor(width / 2), y: Math.floor(height * 0.7) })
            .down()
            .move({ x: Math.floor(width / 2), y: Math.floor(height * 0.3), duration: 500 })
            .up()
            .perform();
    }

    /**
     * Scroll up on the current screen
     */
    async scrollUp(): Promise<void> {
        const { height, width } = await browser.getWindowSize();
        await browser.action('pointer')
            .move({ x: Math.floor(width / 2), y: Math.floor(height * 0.3) })
            .down()
            .move({ x: Math.floor(width / 2), y: Math.floor(height * 0.7), duration: 500 })
            .up()
            .perform();
    }

    /**
     * Pull to refresh gesture
     */
    async pullToRefresh(waitMs: number = 1000): Promise<void> {
        const { height, width } = await browser.getWindowSize();
        await browser.action('pointer')
            .move({ x: Math.floor(width / 2), y: Math.floor(height * 0.2) })
            .down()
            .move({ x: Math.floor(width / 2), y: Math.floor(height * 0.8), duration: 200 })
            .up()
            .perform();
        await browser.pause(waitMs); // Wait for refresh
    }

    /**
     * Tap the back button (standard iOS navigation)
     */
    async goBack(): Promise<void> {
        const backButton = await $('~Back');
        if (await backButton.isExisting()) {
            await backButton.click();
            await browser.pause(500);
        }
    }

    /**
     * Dismiss keyboard if visible
     */
    async dismissKeyboard(): Promise<void> {
        try {
            await driver.hideKeyboard();
        } catch {
            // Keyboard might not be visible, ignore
        }
    }
}

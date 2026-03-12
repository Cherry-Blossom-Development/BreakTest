/**
 * Base page object containing common methods for iOS screens
 */
export default class BasePage {
    /**
     * Returns an element located by iOS accessibility identifier
     */
    protected aid(id: string) {
        return $(`~${id}`);
    }

    /**
     * Returns all elements with the given iOS accessibility identifier
     */
    protected aids(id: string) {
        return $$(`~${id}`);
    }

    /**
     * Waits for an element to be displayed
     * @param selector - The element selector
     * @param timeout - Optional timeout in ms
     */
    async waitForDisplayed(selector: string, timeout = 30000): Promise<void> {
        const element = await $(selector);
        await element.waitForDisplayed({ timeout });
    }

    /**
     * Waits for an element to be clickable
     * @param selector - The element selector
     * @param timeout - Optional timeout in ms
     */
    async waitForClickable(selector: string, timeout = 30000): Promise<void> {
        const element = await $(selector);
        await element.waitForEnabled({ timeout });
    }

    /**
     * Scrolls down until element is visible
     * @param selector - The element selector to scroll to
     */
    async scrollToElement(selector: string): Promise<void> {
        const element = await $(selector);
        await element.scrollIntoView();
    }

    /**
     * Takes a screenshot
     */
    async takeScreenshot(): Promise<string> {
        return driver.takeScreenshot();
    }

    /**
     * Hides the keyboard if visible
     */
    async hideKeyboard(): Promise<void> {
        try {
            await driver.hideKeyboard();
        } catch {
            // Keyboard might not be visible
        }
    }

    /**
     * Waits for the app to be ready (splash screen finished)
     * @param timeout - Optional timeout in ms
     */
    async waitForAppReady(timeout = 30000): Promise<void> {
        // Override in specific pages with appropriate element
        await driver.pause(2000);
    }

    /**
     * Taps at specific coordinates
     * @param x - X coordinate
     * @param y - Y coordinate
     */
    async tapAtCoordinates(x: number, y: number): Promise<void> {
        await driver.touchAction({
            action: 'tap',
            x,
            y,
        });
    }

    /**
     * Goes back (iOS swipe from edge or back button)
     */
    async goBack(): Promise<void> {
        // Swipe from left edge to go back
        const { width, height } = await driver.getWindowSize();
        await driver.touchAction([
            { action: 'press', x: 10, y: height / 2 },
            { action: 'wait', ms: 100 },
            { action: 'moveTo', x: width / 2, y: height / 2 },
            { action: 'release' },
        ]);
    }
}

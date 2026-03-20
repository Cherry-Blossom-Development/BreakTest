import BasePage from './BasePage';

/**
 * Page object for the EULA acceptance screen
 * Shown to users after login when they haven't accepted the current EULA
 */
class EulaPage extends BasePage {
    /**
     * Accept EULA button
     */
    get acceptButton() {
        return this.aid('acceptEulaButton');
    }

    /**
     * EULA title text - appears even while loading
     */
    get eulaTitle() {
        return $('//*[contains(@label, "End User License Agreement")]');
    }

    /**
     * Check if EULA screen is displayed (button is visible and ready)
     */
    async isDisplayed(): Promise<boolean> {
        try {
            const button = await this.acceptButton;
            return await button.isDisplayed();
        } catch {
            return false;
        }
    }

    /**
     * Check if we're on the EULA screen (even if still loading)
     */
    async isOnEulaScreen(): Promise<boolean> {
        try {
            const title = await this.eulaTitle;
            return await title.isDisplayed();
        } catch {
            return false;
        }
    }

    /**
     * Wait for EULA screen to be displayed
     */
    async waitForDisplayed(timeout = 10000): Promise<void> {
        const button = await this.acceptButton;
        await button.waitForDisplayed({ timeout });
    }

    /**
     * Accept the EULA terms
     */
    async accept(): Promise<void> {
        const button = await this.acceptButton;
        await button.waitForDisplayed({ timeout: 10000 });
        await button.waitForEnabled({ timeout: 10000 });
        await button.click();
        // Wait for the screen to dismiss
        await driver.pause(2000);
    }

    /**
     * Accept EULA if displayed, otherwise do nothing
     * Useful as a post-login helper
     */
    async acceptIfDisplayed(): Promise<boolean> {
        // Wait a moment for the screen to settle after login
        await driver.pause(3000);

        // First check if we're on the EULA screen at all
        const onEulaScreen = await this.isOnEulaScreen();
        if (!onEulaScreen) {
            // Check if main app is showing instead
            const tabBar = await $('~tabChat');
            const tabBarVisible = await tabBar.isDisplayed().catch(() => false);
            if (tabBarVisible) {
                console.log('Main app visible, no EULA needed');
                return false;
            }
            console.log('Neither EULA nor main app visible, waiting...');
        }

        // If we're on EULA screen, wait for the accept button to appear
        // (it appears after API call completes)
        if (onEulaScreen) {
            console.log('On EULA screen, waiting for accept button...');
            try {
                const button = await this.acceptButton;
                await button.waitForDisplayed({ timeout: 15000 });
                await button.waitForEnabled({ timeout: 10000 });
                console.log('Accept button ready, clicking...');
                await button.click();
                await driver.pause(3000); // Wait for acceptance to process
                return true;
            } catch (e) {
                console.log('Failed to find/click accept button:', e);
                return false;
            }
        }

        // Not on EULA screen, check a few more times in case it's loading
        for (let attempt = 0; attempt < 3; attempt++) {
            await driver.pause(2000);
            const isShown = await this.isDisplayed();
            if (isShown) {
                console.log('EULA accept button appeared, clicking...');
                await this.accept();
                return true;
            }
            // Check if we're past EULA now
            const tabBar = await $('~tabChat');
            const tabBarVisible = await tabBar.isDisplayed().catch(() => false);
            if (tabBarVisible) {
                console.log('Main app now visible');
                return false;
            }
        }
        return false;
    }
}

export default new EulaPage();

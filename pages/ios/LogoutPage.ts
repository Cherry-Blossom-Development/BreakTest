import BasePage from './BasePage';

/**
 * Page object for logout-related interactions on iOS.
 * Logout is accessed via the hamburger menu in the top-left toolbar.
 */
class LogoutPage extends BasePage {
    get menuButton() {
        return this.aid('menuButton');
    }

    get logoutButton() {
        return this.aid('menuLogoutButton');
    }

    get breakroomTab() {
        // Tab bar buttons expose SF Symbol names, not custom identifiers
        return this.aid('square.grid.2x2');
    }

    /**
     * Wait for the main app to be ready (tab bar visible).
     */
    async waitForMainApp(timeout = 15000): Promise<void> {
        await this.breakroomTab.waitForDisplayed({ timeout });
    }

    /**
     * Opens the menu and taps Logout.
     * Logout is at the bottom of the menu, so we may need to scroll.
     */
    async logout(): Promise<void> {
        // First ensure we're on the main app (not EULA or login)
        await this.waitForMainApp();
        await this.menuButton.waitForDisplayed({ timeout: 10000 });
        await this.menuButton.click();
        await driver.pause(2000); // Wait for menu to fully open

        // The menu is a system popup that may need scrolling to reach Logout at the bottom.
        // Try to find and click the logout button, using swipe to scroll if needed.
        for (let attempt = 0; attempt < 5; attempt++) {
            try {
                const button = await this.logoutButton;
                const isDisplayed = await button.isDisplayed();
                if (isDisplayed) {
                    await button.click();
                    return;
                }
            } catch {
                // Element not found or not visible yet
            }

            // Swipe up to scroll the menu down (reveal items at bottom)
            const { width, height } = await driver.getWindowRect();
            await driver.execute('mobile: swipe', {
                direction: 'up',
                velocity: 500,
            });
            await driver.pause(500);
        }

        // Final attempt after scrolling
        await this.logoutButton.waitForDisplayed({ timeout: 5000 });
        await this.logoutButton.click();
    }

    /**
     * Returns true if the menu button is currently visible.
     * This indicates the user is authenticated and on the main app.
     */
    async isMenuVisible(): Promise<boolean> {
        try {
            await this.waitForMainApp(5000);
            return await this.menuButton.isDisplayed();
        } catch {
            return false;
        }
    }

    /**
     * Opens the menu and checks if logout option is visible.
     * Logout is at the bottom of the menu, so we may need to scroll.
     */
    async isLogoutVisible(): Promise<boolean> {
        try {
            // Wait for main app to be ready
            await this.waitForMainApp(10000);
            await this.menuButton.waitForDisplayed({ timeout: 5000 });
            await this.menuButton.click();
            await driver.pause(2000); // Wait for menu to fully open

            // Try to find the logout button, using swipe to scroll if needed
            for (let attempt = 0; attempt < 5; attempt++) {
                try {
                    const button = await this.logoutButton;
                    const isDisplayed = await button.isDisplayed();
                    if (isDisplayed) return true;
                } catch {
                    // Element not found or not visible yet
                }

                // Swipe up to scroll the menu down (reveal items at bottom)
                await driver.execute('mobile: swipe', {
                    direction: 'up',
                    velocity: 500,
                });
                await driver.pause(500);
            }

            // Final check after scrolling
            try {
                await this.logoutButton.waitForDisplayed({ timeout: 3000 });
                return true;
            } catch {
                return false;
            }
        } catch (e) {
            console.log('isLogoutVisible error:', e);
            return false;
        }
    }
}

export default new LogoutPage();

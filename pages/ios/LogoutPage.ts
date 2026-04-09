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

    /**
     * Opens the menu and taps Logout.
     */
    async logout(): Promise<void> {
        await this.menuButton.waitForDisplayed({ timeout: 10000 });
        await this.menuButton.click();
        await driver.pause(500); // Wait for menu to open
        await this.logoutButton.waitForDisplayed({ timeout: 5000 });
        await this.logoutButton.click();
    }

    /**
     * Returns true if the menu button is currently visible.
     * This indicates the user is authenticated.
     */
    async isMenuVisible(): Promise<boolean> {
        try {
            return await this.menuButton.isDisplayed();
        } catch {
            return false;
        }
    }

    /**
     * Opens the menu and checks if logout option is visible.
     */
    async isLogoutVisible(): Promise<boolean> {
        try {
            await this.menuButton.waitForDisplayed({ timeout: 5000 });
            await this.menuButton.click();
            await driver.pause(500);
            const visible = await this.logoutButton.isDisplayed();
            // Tap outside to close menu
            await driver.touchAction({
                action: 'tap',
                x: 100,
                y: 100,
            });
            return visible;
        } catch {
            return false;
        }
    }
}

export default new LogoutPage();

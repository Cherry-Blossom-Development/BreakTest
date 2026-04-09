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
        return this.aid('tabBreakroom');
    }

    /**
     * Wait for the main app to be ready (tab bar visible).
     */
    async waitForMainApp(timeout = 15000): Promise<void> {
        await this.breakroomTab.waitForDisplayed({ timeout });
    }

    /**
     * Opens the menu and taps Logout.
     */
    async logout(): Promise<void> {
        // First ensure we're on the main app (not EULA or login)
        await this.waitForMainApp();
        await this.menuButton.waitForDisplayed({ timeout: 10000 });
        await this.menuButton.click();
        await driver.pause(1000); // Wait for menu to open
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
     */
    async isLogoutVisible(): Promise<boolean> {
        try {
            // Wait for main app to be ready
            await this.waitForMainApp(10000);
            await this.menuButton.waitForDisplayed({ timeout: 5000 });
            await this.menuButton.click();
            await driver.pause(1500); // Wait for menu animation

            // Wait for logout button to appear and check visibility
            try {
                await this.logoutButton.waitForDisplayed({ timeout: 5000 });
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

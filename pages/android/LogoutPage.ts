import BasePage from './BasePage';

/**
 * Page object for logout-related interactions on Android.
 * Logout is accessed via the navigation drawer (hamburger menu → Logout).
 */
class LogoutPage extends BasePage {
    get menuButton() {
        return this.rid('nav-menu-button');
    }

    get drawerLogoutItem() {
        return this.rid('drawer-logout-item');
    }

    /**
     * Opens the navigation drawer and taps Logout.
     */
    async logout(): Promise<void> {
        await this.menuButton.waitForDisplayed({ timeout: 10000 });
        await this.menuButton.click();
        await this.drawerLogoutItem.waitForDisplayed({ timeout: 5000 });
        await this.drawerLogoutItem.click();
    }

    /**
     * Returns true if the drawer logout item is currently visible.
     */
    async isLogoutVisible(): Promise<boolean> {
        try {
            await this.menuButton.waitForDisplayed({ timeout: 5000 });
            await this.menuButton.click();
            const visible = await this.drawerLogoutItem.isDisplayed();
            await driver.back(); // close drawer
            return visible;
        } catch {
            return false;
        }
    }
}

export default new LogoutPage();

import BasePage from './BasePage';

/**
 * Page object for logout-related interactions.
 * Logout is triggered via the sidebar nav item present on all authenticated pages.
 */
class LogoutPage extends BasePage {
    get logoutLink() {
        return $('.logout-item');
    }

    async logout(): Promise<void> {
        await this.logoutLink.waitForClickable({ timeout: 5000 });
        await this.logoutLink.click();
    }
}

export default new LogoutPage();

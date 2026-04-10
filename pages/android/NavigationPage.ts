import BasePage from './BasePage';

/**
 * Page object for Android navigation verification.
 * Each screen exposes a testTag that confirms it loaded.
 * Drawer items are tapped by text (no testTag needed on them).
 */
class NavigationPage extends BasePage {
    // ── Bottom nav buttons ─────────────────────────────────────────────────
    get bottomNavHome()          { return this.rid('nav-home'); }
    get bottomNavChat()          { return this.rid('nav-chat'); }
    get bottomNavEmployment()    { return this.rid('nav-employment'); }
    get bottomNavCompanyPortal() { return this.rid('nav-company-portal'); }
    get bottomNavToolShed()      { return this.rid('nav-tool-shed'); }

    // ── Hamburger menu button (opens drawer) ────────────────────────────────
    get menuButton() { return this.rid('nav-menu-button'); }

    // ── Screen-specific identifiers ─────────────────────────────────────────
    get screenHome()          { return this.rid('screen-home'); }
    get screenChat()          { return this.rid('room-list'); }       // ChatScreen already tagged
    get screenBlog()          { return this.rid('screen-blog'); }
    get screenFriends()       { return this.rid('screen-friends'); }
    get screenProfile()       { return this.rid('screen-profile'); }
    get screenSessions()      { return this.rid('screen-sessions'); }
    get screenToolShed()      { return this.rid('screen-tool-shed'); }
    get screenEmployment()    { return this.rid('screen-employment'); }
    get screenHelpDesk()      { return this.rid('screen-helpdesk'); }
    get screenCompanyPortal() { return this.rid('screen-company-portal'); }
    get screenLegal()         { return this.rid('screen-legal'); }

    // ── Pre-auth screen identifiers (reuse existing tags) ──────────────────
    get screenLogin()         { return this.rid('username-input'); }
    get screenSignup()        { return this.rid('handle-input'); }
    get screenForgotPassword(){ return this.rid('email-input'); }

    /**
     * Opens the drawer and taps an item by its visible text label.
     */
    async openDrawerAndTap(itemText: string): Promise<void> {
        await this.menuButton.waitForDisplayed({ timeout: 10000 });
        await this.menuButton.click();
        await driver.pause(500);
        const item = await $(`android=new UiSelector().text("${itemText}")`);
        await item.waitForDisplayed({ timeout: 5000 });
        await item.click();
    }
}

export default new NavigationPage();

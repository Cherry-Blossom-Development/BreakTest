import BasePage from './BasePage';

/**
 * Page object for iOS navigation verification.
 * Each screen exposes an accessibility identifier that confirms it loaded.
 * Menu items are tapped via their accessibility identifiers.
 */
class NavigationPage extends BasePage {
    /**
     * Go back using the native iOS back gesture.
     * Overrides the broken touchAction-based goBack() in BasePage.
     */
    async goBack(): Promise<void> {
        await driver.back();
    }

    // -- Tab bar buttons (use SF Symbol names from SwiftUI Label systemImage) --
    get tabBreakroom()      { return this.aid('square.grid.2x2'); }
    get tabChat()           { return this.aid('bubble.left.and.bubble.right'); }
    get tabJobs()           { return this.aid('briefcase'); }
    get tabCompany()        { return this.aid('building.2'); }
    get tabToolShed()       { return this.aid('wrench.and.screwdriver'); }

    // -- Hamburger menu button (opens menu) --
    get menuButton() { return this.aid('menuButton'); }

    // -- Menu items --
    get menuProfile() { return this.aid('menuProfile'); }
    get menuChat()    { return this.aid('menuChat'); }
    get menuFriends() { return this.aid('menuFriends'); }
    get menuBlog()    { return this.aid('menuBlog'); }
    get menuLegal()   { return this.aid('menuLegal'); }

    // -- Screen-specific identifiers --
    get screenHome()          { return this.aid('screenHome'); }
    get screenChat()          { return this.aid('screenChat'); }
    get screenBlog()          { return this.aid('screenBlog'); }
    get screenFriends()       { return this.aid('screenFriends'); }
    get screenProfile()       { return this.aid('screenProfile'); }
    get screenToolShed()      { return this.aid('screenToolShed'); }
    get screenEmployment()    { return this.aid('screenEmployment'); }
    get screenCompanyPortal() { return this.aid('screenCompanyPortal'); }
    get screenLegal()         { return this.aid('screenLegal'); }

    // -- Pre-auth screen identifiers --
    get screenLogin()          { return this.aid('usernameField'); }
    get screenSignup()         { return this.aid('handleField'); }
    get screenForgotPassword() { return this.aid('forgotPasswordEmailField'); }

    /**
     * Opens the menu and taps an item by its accessibility identifier.
     */
    async openMenuAndTap(menuItemId: string): Promise<void> {
        await this.menuButton.waitForDisplayed({ timeout: 10000 });
        await this.menuButton.click();
        await driver.pause(1000); // Wait for menu animation
        const item = await this.aid(menuItemId);
        await item.waitForDisplayed({ timeout: 5000 });
        await item.click();
    }

    /**
     * Navigate to Profile via menu.
     */
    async goToProfile(): Promise<void> {
        await this.openMenuAndTap('menuProfile');
    }

    /**
     * Navigate to Friends via menu.
     */
    async goToFriends(): Promise<void> {
        await this.openMenuAndTap('menuFriends');
    }

    /**
     * Navigate to Blog via menu.
     */
    async goToBlog(): Promise<void> {
        await this.openMenuAndTap('menuBlog');
    }

    /**
     * Navigate to Legal via menu.
     */
    async goToLegal(): Promise<void> {
        await this.openMenuAndTap('menuLegal');
    }

    /**
     * Navigate to Chat via menu (switches tab).
     */
    async goToChatViaMenu(): Promise<void> {
        await this.openMenuAndTap('menuChat');
    }
}

export default new NavigationPage();

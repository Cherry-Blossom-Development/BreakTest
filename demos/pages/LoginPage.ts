/**
 * Login Page for iOS Demo Scripts
 *
 * Handles login screen interactions.
 */

import BasePage from './BasePage';

class LoginPage extends BasePage {
    /**
     * Page elements - using text/predicate selectors for compatibility
     */
    get usernameInput() {
        // Try accessibility ID first, then fall back to placeholder text
        return $('-ios predicate string:type == "XCUIElementTypeTextField"');
    }

    get passwordInput() {
        return $('-ios predicate string:type == "XCUIElementTypeSecureTextField"');
    }

    get loginButton() {
        // Find button with "Log In" text
        return $('-ios predicate string:type == "XCUIElementTypeButton" AND label == "Log In"');
    }

    get logoImage() {
        return $('-ios predicate string:type == "XCUIElementTypeImage"');
    }

    get errorMessage() {
        // Error message is red text - find by type
        return $('-ios predicate string:type == "XCUIElementTypeStaticText" AND NOT (label == "Log In" OR label == "Handle" OR label == "Password" OR label CONTAINS "Sign Up")');
    }

    /**
     * Wait for login screen to be visible
     */
    async waitForScreen(timeout: number = 10000): Promise<void> {
        // Wait for the text field (username input) to be visible
        await this.usernameInput.waitForDisplayed({ timeout });
    }

    /**
     * Check if login screen is displayed
     */
    async isDisplayed(): Promise<boolean> {
        return await this.loginButton.isDisplayed();
    }

    /**
     * Perform login with given credentials
     */
    async login(username: string, password: string): Promise<void> {
        console.log(`Logging in as: ${username}`);

        // Clear and enter username
        await this.usernameInput.waitForDisplayed();
        await this.usernameInput.clearValue();
        await this.usernameInput.setValue(username);
        await this.naturalPause(300);

        // Clear and enter password
        await this.passwordInput.clearValue();
        await this.passwordInput.setValue(password);
        await this.naturalPause(300);

        // Dismiss keyboard
        await this.dismissKeyboard();
        await this.naturalPause(200);

        // Tap login button
        await this.loginButton.click();
        await this.naturalPause(500);
    }

    /**
     * Dismiss the iOS "Save Password?" dialog if it appears
     */
    async dismissSavePasswordDialog(): Promise<void> {
        try {
            // Look for "Not Now" button in the save password dialog
            const notNowButton = await $('-ios predicate string:type == "XCUIElementTypeButton" AND label == "Not Now"');
            if (await notNowButton.isExisting()) {
                console.log('Dismissing Save Password dialog...');
                await notNowButton.click();
                await this.naturalPause(500);
            }
        } catch {
            // Dialog not present, continue
        }
    }

    /**
     * Perform login with natural typing (for demos)
     */
    async loginWithNaturalTyping(username: string, password: string): Promise<void> {
        console.log(`Logging in as: ${username} (with natural typing)`);

        // Wait for screen
        await this.usernameInput.waitForDisplayed();
        await this.naturalPause(500);

        // Type username slowly
        await this.typeSlowly(this.usernameInput, username, 80);
        await this.naturalPause(400);

        // Type password slowly
        await this.typeSlowly(this.passwordInput, password, 80);
        await this.naturalPause(400);

        // Dismiss keyboard
        await this.dismissKeyboard();
        await this.naturalPause(300);

        // Tap login button
        await this.loginButton.click();
        await this.naturalPause(1500);

        // Handle "Save Password?" dialog
        await this.dismissSavePasswordDialog();
    }

    /**
     * Perform login with fast typing (for 30-second demos)
     */
    async loginWithFastTyping(username: string, password: string): Promise<void> {
        console.log(`Logging in as: ${username} (fast)`);

        // Wait for screen
        await this.usernameInput.waitForDisplayed();
        await browser.pause(200);

        // Type username quickly
        await this.typeSlowly(this.usernameInput, username, 25);
        await browser.pause(150);

        // Type password quickly
        await this.typeSlowly(this.passwordInput, password, 25);
        await browser.pause(150);

        // Dismiss keyboard
        await this.dismissKeyboard();
        await browser.pause(100);

        // Tap login button
        await this.loginButton.click();
        await browser.pause(800);

        // Handle "Save Password?" dialog
        await this.dismissSavePasswordDialog();
    }

    /**
     * Check if an error message is displayed
     */
    async hasError(): Promise<boolean> {
        return await this.errorMessage.isDisplayed();
    }

    /**
     * Get the error message text
     */
    async getErrorText(): Promise<string> {
        if (await this.hasError()) {
            return await this.errorMessage.getText();
        }
        return '';
    }
}

export default new LoginPage();

/**
 * Login Page for iOS Demo Scripts
 *
 * Handles login screen interactions.
 */

import BasePage from './BasePage';

class LoginPage extends BasePage {
    /**
     * Page elements
     */
    get usernameInput() {
        return $('~usernameField');
    }

    get passwordInput() {
        return $('~passwordField');
    }

    get loginButton() {
        return $('~loginButton');
    }

    get logoImage() {
        return $('~appLogo');
    }

    get errorMessage() {
        return $('~errorMessage');
    }

    /**
     * Wait for login screen to be visible
     */
    async waitForScreen(timeout: number = 10000): Promise<void> {
        await this.loginButton.waitForDisplayed({ timeout });
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

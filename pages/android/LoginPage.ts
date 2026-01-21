import BasePage from './BasePage';

/**
 * Page object for the Android Login screen
 */
class LoginPage extends BasePage {
    /**
     * Selectors for screen elements
     * Using accessibility IDs and resource-ids for Android
     */
    get usernameInput() {
        return $('~username-input, android=new UiSelector().resourceId("username"), android=new UiSelector().text("Username")');
    }

    get passwordInput() {
        return $('~password-input, android=new UiSelector().resourceId("password"), android=new UiSelector().text("Password")');
    }

    get loginButton() {
        return $('~login-button, android=new UiSelector().text("Login"), android=new UiSelector().text("Sign In")');
    }

    get errorMessage() {
        return $('~error-message, android=new UiSelector().resourceId("error")');
    }

    get signupButton() {
        return $('~signup-button, android=new UiSelector().text("Sign Up"), android=new UiSelector().text("Register")');
    }

    /**
     * Waits for the login screen to be ready
     */
    async waitForScreen(timeout = 30000): Promise<void> {
        await this.usernameInput.waitForDisplayed({ timeout });
    }

    /**
     * Performs login with given credentials
     * @param username - The username or email
     * @param password - The password
     */
    async login(username: string, password: string): Promise<void> {
        await this.waitForScreen();
        await this.usernameInput.setValue(username);
        await this.passwordInput.setValue(password);
        await this.hideKeyboard();
        await this.loginButton.click();
    }

    /**
     * Checks if the login screen is displayed
     */
    async isDisplayed(): Promise<boolean> {
        try {
            return await this.usernameInput.isDisplayed();
        } catch {
            return false;
        }
    }

    /**
     * Gets the error message text if displayed
     */
    async getErrorMessage(): Promise<string> {
        try {
            if (await this.errorMessage.isDisplayed()) {
                return await this.errorMessage.getText();
            }
        } catch {
            // Error message not displayed
        }
        return '';
    }

    /**
     * Navigates to the signup screen
     */
    async goToSignup(): Promise<void> {
        await this.signupButton.click();
    }
}

export default new LoginPage();

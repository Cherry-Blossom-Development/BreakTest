import BasePage from './BasePage';

/**
 * Page object for the Login page
 */
class LoginPage extends BasePage {
    /**
     * Selectors for page elements
     */
    get usernameInput() {
        return $('input[type="text"], input[name="username"], input[name="email"]');
    }

    get passwordInput() {
        return $('input[type="password"]');
    }

    get loginButton() {
        return $('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    }

    get errorMessage() {
        return $('.error, .error-message, [class*="error"]');
    }

    get signupLink() {
        return $('a[href*="signup"], a:has-text("Sign Up"), a:has-text("Register")');
    }

    /**
     * Opens the login page
     */
    async open(): Promise<void> {
        await super.open('/login');
    }

    /**
     * Performs login with given credentials
     * @param username - The username or email
     * @param password - The password
     */
    async login(username: string, password: string): Promise<void> {
        await this.usernameInput.waitForDisplayed();
        await this.usernameInput.setValue(username);
        await this.passwordInput.setValue(password);
        await this.loginButton.click();
    }

    /**
     * Checks if the login form is displayed
     */
    async isDisplayed(): Promise<boolean> {
        return this.usernameInput.isDisplayed();
    }

    /**
     * Gets the error message text if displayed
     */
    async getErrorMessage(): Promise<string> {
        if (await this.errorMessage.isDisplayed()) {
            return this.errorMessage.getText();
        }
        return '';
    }

    /**
     * Clicks the signup link
     */
    async goToSignup(): Promise<void> {
        await this.signupLink.click();
    }
}

export default new LoginPage();

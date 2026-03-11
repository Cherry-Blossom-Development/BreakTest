import BasePage from './BasePage';

class LoginPage extends BasePage {
    get usernameInput() {
        return this.rid('username-input');
    }

    get passwordInput() {
        return this.rid('password-input');
    }

    get loginButton() {
        return this.rid('login-button');
    }

    get errorMessage() {
        return this.rid('error-message');
    }

    get signupButton() {
        return this.rid('signup-button');
    }

    async waitForScreen(timeout = 30000): Promise<void> {
        await this.usernameInput.waitForDisplayed({ timeout });
    }

    async login(username: string, password: string): Promise<void> {
        await this.waitForScreen();
        await this.usernameInput.setValue(username);
        await this.passwordInput.setValue(password);
        await this.hideKeyboard();
        await this.loginButton.click();
    }

    async isDisplayed(): Promise<boolean> {
        try {
            return await this.usernameInput.isDisplayed();
        } catch {
            return false;
        }
    }

    async getErrorMessage(): Promise<string> {
        try {
            await this.errorMessage.waitForDisplayed({ timeout: 5000 });
            return await this.errorMessage.getText();
        } catch {
            return '';
        }
    }

    async goToSignup(): Promise<void> {
        await this.signupButton.click();
    }
}

export default new LoginPage();

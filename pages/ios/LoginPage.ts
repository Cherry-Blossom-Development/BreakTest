import BasePage from './BasePage';

class LoginPage extends BasePage {
    get usernameInput() {
        return this.aid('usernameField');
    }

    get passwordInput() {
        return this.aid('passwordField');
    }

    get loginButton() {
        return this.aid('loginButton');
    }

    get errorMessage() {
        return this.aid('errorMessage');
    }

    get signupButton() {
        return this.aid('signupButton');
    }

    get forgotPasswordButton() {
        return this.aid('forgotPasswordButton');
    }

    get appLogo() {
        return this.aid('appLogo');
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

    async goToForgotPassword(): Promise<void> {
        await this.forgotPasswordButton.click();
    }
}

export default new LoginPage();

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

        // Click and type username using setValue
        const usernameEl = await this.usernameInput;
        await usernameEl.click();
        await driver.pause(300);
        await usernameEl.setValue(username);
        await driver.pause(300);

        // Click and type password using setValue
        const passwordEl = await this.passwordInput;
        await passwordEl.click();
        await driver.pause(300);
        await passwordEl.setValue(password);
        await driver.pause(300);

        // Dismiss keyboard to ensure SwiftUI bindings update
        try {
            await driver.hideKeyboard();
        } catch {
            // Keyboard might not be showing
        }
        await driver.pause(500);

        // Click login button
        const loginBtn = await this.loginButton;
        await loginBtn.click();
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

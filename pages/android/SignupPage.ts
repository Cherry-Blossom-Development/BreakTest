import BasePage from './BasePage';

class SignupPage extends BasePage {
    get handleInput() {
        return $('~handle-input');
    }

    get firstNameInput() {
        return $('~firstname-input');
    }

    get lastNameInput() {
        return $('~lastname-input');
    }

    get emailInput() {
        return $('~email-input');
    }

    get passwordInput() {
        return $('~password-input');
    }

    get confirmPasswordInput() {
        return $('~confirm-password-input');
    }

    get createAccountButton() {
        return $('~create-account-button');
    }

    get errorMessage() {
        return $('~error-message');
    }

    get loginButton() {
        return $('~login-button');
    }

    async waitForScreen(timeout = 30000): Promise<void> {
        await this.handleInput.waitForDisplayed({ timeout });
    }

    async signup(
        handle: string,
        firstName: string,
        lastName: string,
        email: string,
        password: string
    ): Promise<void> {
        await this.waitForScreen();
        await this.handleInput.setValue(handle);
        await this.firstNameInput.setValue(firstName);
        await this.lastNameInput.setValue(lastName);
        await this.emailInput.setValue(email);
        await this.passwordInput.setValue(password);
        await this.confirmPasswordInput.setValue(password);
        await this.hideKeyboard();
        await this.createAccountButton.click();
    }

    async isDisplayed(): Promise<boolean> {
        try {
            return await this.handleInput.isDisplayed();
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

    async goToLogin(): Promise<void> {
        await this.loginButton.click();
    }
}

export default new SignupPage();

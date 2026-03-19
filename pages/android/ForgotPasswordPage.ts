import BasePage from './BasePage';

class ForgotPasswordPage extends BasePage {
    get emailInput() {
        return this.rid('email-input');
    }

    get submitButton() {
        return this.rid('submit-button');
    }

    get backToLoginButton() {
        return this.rid('back-to-login-button');
    }

    get successMessage() {
        return this.rid('success-message');
    }

    get successBackToLoginButton() {
        return this.rid('success-back-to-login-button');
    }

    get errorMessage() {
        return this.rid('error-message');
    }

    async waitForScreen(timeout = 30000): Promise<void> {
        await this.emailInput.waitForDisplayed({ timeout });
    }

    async isDisplayed(): Promise<boolean> {
        try {
            return await this.emailInput.isDisplayed();
        } catch {
            return false;
        }
    }

    async requestReset(email: string): Promise<void> {
        await this.waitForScreen();
        await this.emailInput.setValue(email);
        await this.hideKeyboard();
        await this.submitButton.click();
    }

    async submitEmpty(): Promise<void> {
        await this.waitForScreen();
        await this.submitButton.click();
    }

    async getErrorMessage(): Promise<string> {
        try {
            await this.errorMessage.waitForDisplayed({ timeout: 5000 });
            return await this.errorMessage.getText();
        } catch {
            return '';
        }
    }
}

export default new ForgotPasswordPage();

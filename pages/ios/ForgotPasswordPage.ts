import BasePage from './BasePage';

class ForgotPasswordPage extends BasePage {
    get emailInput() {
        return this.aid('forgotPasswordEmailField');
    }

    get submitButton() {
        return this.aid('forgotPasswordSubmitButton');
    }

    get successIcon() {
        return this.aid('forgotPasswordSuccessIcon');
    }

    get successMessage() {
        return this.aid('forgotPasswordSuccessMessage');
    }

    get errorMessage() {
        return this.aid('forgotPasswordErrorMessage');
    }

    get backToLoginButton() {
        return this.aid('forgotPasswordBackToLoginButton');
    }

    get titleText() {
        return this.aid('forgotPasswordTitle');
    }

    async waitForScreen(timeout = 30000): Promise<void> {
        await this.emailInput.waitForDisplayed({ timeout });
    }

    async requestReset(email: string): Promise<void> {
        await this.waitForScreen();
        await this.emailInput.setValue(email);
        await this.hideKeyboard();
        await this.submitButton.click();
    }

    async isDisplayed(): Promise<boolean> {
        try {
            return await this.emailInput.isDisplayed();
        } catch {
            return false;
        }
    }

    async getSuccessMessage(): Promise<string> {
        try {
            await this.successMessage.waitForDisplayed({ timeout: 10000 });
            return await this.successMessage.getText();
        } catch {
            return '';
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

    async goBackToLogin(): Promise<void> {
        await this.backToLoginButton.click();
    }

    async isSuccessDisplayed(): Promise<boolean> {
        try {
            return await this.successIcon.isDisplayed();
        } catch {
            return false;
        }
    }
}

export default new ForgotPasswordPage();

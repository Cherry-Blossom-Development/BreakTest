import BasePage from './BasePage';

class ForgotPasswordPage extends BasePage {
    get emailInput() {
        return $('input[type="email"]');
    }

    get submitButton() {
        return $('button[type="submit"]');
    }

    get successMessage() {
        return $('.success');
    }

    get errorMessage() {
        return $('.error');
    }

    get backToLoginLink() {
        return $('a[href="/login"]');
    }

    async open(): Promise<void> {
        await super.open('/forgot-password');
    }

    async requestReset(email: string): Promise<void> {
        await this.emailInput.waitForExist({ timeout: 10000 });
        await this.emailInput.setValue(email);
        await this.submitButton.click();
    }

    async getSuccessMessage(): Promise<string> {
        if (await this.successMessage.isExisting()) {
            return this.successMessage.getText();
        }
        return '';
    }
}

export default new ForgotPasswordPage();

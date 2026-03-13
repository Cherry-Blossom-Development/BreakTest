import BasePage from './BasePage';

class ResetPasswordPage extends BasePage {
    get passwordInput() {
        return $('form input[type="password"]');
    }

    get confirmPasswordInput() {
        return $('form input[type="password"]:nth-of-type(2)');
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

    get invalidTokenBlock() {
        return $('.error-block');
    }

    async open(token: string): Promise<void> {
        await super.open(`/reset-password?token=${token}`);
    }

    async resetPassword(password: string, confirmPassword: string): Promise<void> {
        const inputs = [...await $$('form input[type="password"]')];
        await inputs[0].setValue(password);
        await inputs[1].setValue(confirmPassword);
        await this.submitButton.click();
    }

    async isTokenInvalid(): Promise<boolean> {
        return this.invalidTokenBlock.isExisting();
    }

    async getErrorMessage(): Promise<string> {
        if (await this.errorMessage.isExisting()) {
            return this.errorMessage.getText();
        }
        return '';
    }

    async getSuccessMessage(): Promise<string> {
        if (await this.successMessage.isExisting()) {
            return this.successMessage.getText();
        }
        return '';
    }
}

export default new ResetPasswordPage();

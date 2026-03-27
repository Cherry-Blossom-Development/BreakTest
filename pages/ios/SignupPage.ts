import BasePage from './BasePage';

class SignupPage extends BasePage {
    get handleInput() {
        return this.aid('handleField');
    }

    get firstNameInput() {
        return this.aid('firstNameField');
    }

    get lastNameInput() {
        return this.aid('lastNameField');
    }

    get emailInput() {
        return this.aid('emailField');
    }

    get passwordInput() {
        return this.aid('passwordField');
    }

    get confirmPasswordInput() {
        return this.aid('confirmPasswordField');
    }

    get createAccountButton() {
        return this.aid('createAccountButton');
    }

    get errorMessage() {
        return this.aid('errorMessage');
    }

    get loginButton() {
        return this.aid('loginButton');
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

        // Enter password fields
        await this.passwordInput.setValue(password);
        await this.confirmPasswordInput.setValue(password);

        // Dismiss iOS password suggestion popup if present
        // This might clear or modify the password fields
        await this.dismissPasswordPopup();
        await this.hideKeyboard();

        // Re-enter passwords after dismissing popup to ensure they're correct
        // The iOS password suggestion popup can interfere with the password fields
        await this.passwordInput.clearValue();
        await this.passwordInput.setValue(password);
        await this.confirmPasswordInput.clearValue();
        await this.confirmPasswordInput.setValue(password);
        await this.hideKeyboard();

        // Small pause to ensure form validation updates
        await driver.pause(300);

        await this.createAccountButton.click();
    }

    /**
     * Dismiss iOS strong password suggestion popup if present
     */
    async dismissPasswordPopup(): Promise<void> {
        try {
            const closeButton = await $('~xmark');
            const isVisible = await closeButton.isDisplayed().catch(() => false);
            if (isVisible) {
                await closeButton.click();
                await driver.pause(300);
            }
        } catch {
            // No popup present
        }
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
            await this.errorMessage.waitForDisplayed({ timeout: 10000 });
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

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

    get forgotPasswordButton() {
        return this.rid('forgot-password-button');
    }

    async waitForScreen(timeout = 30000): Promise<void> {
        // clearApp resets runtime permissions every cycle. Use mobile: changePermissions
        // (no adb_shell required) to re-grant notification permission so the OS dialog
        // never blocks the login screen.
        try {
            await driver.execute('mobile: changePermissions', {
                permissions: ['android.permission.POST_NOTIFICATIONS'],
                action: 'grant',
                appPackage: 'com.cherryblossomdev.breakroom',
            });
        } catch { /* non-critical — dialog fallback below */ }

        // Also dismiss the dialog in case it appeared before the grant took effect
        try {
            const allowBtn = $('android=new UiSelector().text("Allow")');
            await allowBtn.waitForDisplayed({ timeout: 5000 });
            await allowBtn.click();
            await allowBtn.waitForDisplayed({ timeout: 3000, reverse: true });
        } catch { /* no dialog present */ }

        await this.usernameInput.waitForDisplayed({ timeout });
    }

    async login(username: string, password: string): Promise<void> {
        await this.waitForScreen();
        await this.usernameInput.setValue(username);
        await this.passwordInput.setValue(password);
        await this.hideKeyboard();
        await this.loginButton.click();
        await this.dismissEulaIfPresent();
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

    async goToSignup(timeout = 30000): Promise<void> {
        await this.waitForScreen(timeout);
        await this.signupButton.click();
    }

    async goToForgotPassword(): Promise<void> {
        await this.waitForScreen();
        await this.forgotPasswordButton.click();
    }
}

export default new LoginPage();

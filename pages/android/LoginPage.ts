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
        // clearApp resets runtime permissions each cycle so the OS notification
        // dialog appears on every fresh launch. Grant it programmatically first,
        // then click Allow on any dialog that's already visible.
        await driver.execute('mobile: changePermissions', {
            permissions: ['android.permission.POST_NOTIFICATIONS'],
            action: 'grant',
            appPackage: 'com.cherryblossomdev.breakroom',
        }).catch(() => {});

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
        // Wait for the login screen to navigate away before handling the EULA.
        // This decouples EULA detection from API response time — on a remote
        // server the login call can take much longer than the old hard-coded 8s.
        try {
            await this.usernameInput.waitForDisplayed({ timeout: 60000, reverse: true });
        } catch {
            // Login screen is still showing — credentials were rejected or the
            // API returned an error. Return so the caller can assert the error state.
            return;
        }
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

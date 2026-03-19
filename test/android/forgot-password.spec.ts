import ForgotPasswordPage from '../../pages/android/ForgotPasswordPage';
import LoginPage from '../../pages/android/LoginPage';
import TestUsers from '../data/testUsers';

describe('Breakroom Android - Forgot Password', () => {
    beforeEach(async () => {
        await driver.terminateApp('com.cherryblossomdev.breakroom');
        await driver.execute('mobile: clearApp', { appId: 'com.cherryblossomdev.breakroom' });
        await driver.activateApp('com.cherryblossomdev.breakroom');
        await LoginPage.waitForScreen();
    });

    it('should be accessible from the login screen', async () => {
        const forgotButton = LoginPage['rid']('forgot-password-button');
        await forgotButton.waitForDisplayed({ timeout: 10000 });
        await forgotButton.click();

        const isDisplayed = await ForgotPasswordPage.isDisplayed();
        expect(isDisplayed).toBe(true);
    });

    it('should display the forgot password screen elements', async () => {
        const forgotButton = LoginPage['rid']('forgot-password-button');
        await forgotButton.click();
        await ForgotPasswordPage.waitForScreen();

        await expect(ForgotPasswordPage.emailInput).toBeDisplayed();
        await expect(ForgotPasswordPage.submitButton).toBeDisplayed();
        await expect(ForgotPasswordPage.backToLoginButton).toBeDisplayed();
    });

    it('should show a validation error when submitting an empty email', async () => {
        const forgotButton = LoginPage['rid']('forgot-password-button');
        await forgotButton.click();
        await ForgotPasswordPage.waitForScreen();

        await ForgotPasswordPage.submitEmpty();

        const errorText = await ForgotPasswordPage.getErrorMessage();
        expect(errorText.length).toBeGreaterThan(0);
    });

    it('should show a success message after submitting a registered email', async () => {
        const forgotButton = LoginPage['rid']('forgot-password-button');
        await forgotButton.click();
        await ForgotPasswordPage.waitForScreen();

        await ForgotPasswordPage.requestReset(TestUsers.standard.email);

        await ForgotPasswordPage.successMessage.waitForDisplayed({ timeout: 15000 });
        await expect(ForgotPasswordPage.successMessage).toBeDisplayed();
    });

    it('should navigate back to login from the success screen', async () => {
        const forgotButton = LoginPage['rid']('forgot-password-button');
        await forgotButton.click();
        await ForgotPasswordPage.waitForScreen();

        await ForgotPasswordPage.requestReset(TestUsers.standard.email);
        await ForgotPasswordPage.successMessage.waitForDisplayed({ timeout: 15000 });

        await ForgotPasswordPage.successBackToLoginButton.click();

        await LoginPage.waitForScreen();
        const isLoginDisplayed = await LoginPage.isDisplayed();
        expect(isLoginDisplayed).toBe(true);
    });
});

import ForgotPasswordPage from '../../pages/android/ForgotPasswordPage';
import LoginPage from '../../pages/android/LoginPage';
import TestUsers from '../data/testUsers';

describe('Breakroom Android - Forgot Password', () => {
    beforeEach(async () => {
        await driver.terminateApp('com.cherryblossomdev.breakroom');
        await driver.pause(2000); // Allow ChatService and other components to fully stop
        await driver.execute('mobile: clearApp', { appId: 'com.cherryblossomdev.breakroom' });
        await driver.activateApp('com.cherryblossomdev.breakroom');
        await LoginPage.waitForScreen(90000); // Wait until login screen is actually ready
    });

    it('should be accessible from the login screen', async () => {
        await LoginPage.goToForgotPassword();

        const isDisplayed = await ForgotPasswordPage.isDisplayed();
        expect(isDisplayed).toBe(true);
    });

    it('should display the forgot password screen elements', async () => {
        await LoginPage.goToForgotPassword();
        await ForgotPasswordPage.waitForScreen();

        await expect(ForgotPasswordPage.emailInput).toBeDisplayed();
        await expect(ForgotPasswordPage.submitButton).toBeDisplayed();
        await expect(ForgotPasswordPage.backToLoginButton).toBeDisplayed();
    });

    it('should show a validation error when submitting an empty email', async () => {
        await LoginPage.goToForgotPassword();
        await ForgotPasswordPage.waitForScreen();

        await ForgotPasswordPage.submitEmpty();

        const errorText = await ForgotPasswordPage.getErrorMessage();
        expect(errorText.length).toBeGreaterThan(0);
    });

    it('should show a success message after submitting a registered email', async () => {
        await LoginPage.goToForgotPassword();
        await ForgotPasswordPage.waitForScreen();

        await ForgotPasswordPage.requestReset(TestUsers.standard.email);

        await ForgotPasswordPage.successMessage.waitForDisplayed({ timeout: 15000 });
        await expect(ForgotPasswordPage.successMessage).toBeDisplayed();
    });

    it('should navigate back to login from the success screen', async () => {
        await LoginPage.goToForgotPassword();
        await ForgotPasswordPage.waitForScreen();

        await ForgotPasswordPage.requestReset(TestUsers.standard.email);
        await ForgotPasswordPage.successMessage.waitForDisplayed({ timeout: 15000 });

        await ForgotPasswordPage.successBackToLoginButton.click();

        await LoginPage.waitForScreen();
        const isLoginDisplayed = await LoginPage.isDisplayed();
        expect(isLoginDisplayed).toBe(true);
    });
});

import LoginPage from '../../pages/ios/LoginPage';
import ForgotPasswordPage from '../../pages/ios/ForgotPasswordPage';
import TestUsers from '../data/testUsers';

const BUNDLE_ID = 'com.cherryblossomdev.Breakroom';
const TEST_API_URL = process.env.TEST_API_URL || 'https://dev.prosaurus.com';

describe('Breakroom iOS - Forgot Password', () => {
    beforeEach(async () => {
        try {
            await driver.terminateApp(BUNDLE_ID);
        } catch {
            // App might not be running
        }
        await driver.execute('mobile: launchApp', {
            bundleId: BUNDLE_ID,
            arguments: ['-CLEAR_AUTH_STATE', 'YES', '-TEST_API_URL', TEST_API_URL],
        });
        await LoginPage.waitForAppReady();
    });

    it('should be accessible from the login screen', async () => {
        // Verify the forgot password button is visible on login screen
        await expect(LoginPage.forgotPasswordButton).toBeDisplayed();
    });

    it('should display the forgot password form', async () => {
        await LoginPage.goToForgotPassword();

        await driver.pause(1000);

        await expect(ForgotPasswordPage.titleText).toBeDisplayed();
        await expect(ForgotPasswordPage.emailInput).toBeDisplayed();
        await expect(ForgotPasswordPage.submitButton).toBeDisplayed();
    });

    it('should have disabled submit button when email is empty', async () => {
        await LoginPage.goToForgotPassword();

        await ForgotPasswordPage.waitForScreen();

        // The submit button should be disabled when email is empty
        const isEnabled = await ForgotPasswordPage.submitButton.isEnabled();
        expect(isEnabled).toBe(false);
    });

    it('should enable submit button when email is entered', async () => {
        await LoginPage.goToForgotPassword();

        await ForgotPasswordPage.waitForScreen();
        await ForgotPasswordPage.emailInput.setValue('test@example.com');
        await ForgotPasswordPage.hideKeyboard();

        // The submit button should now be enabled
        const isEnabled = await ForgotPasswordPage.submitButton.isEnabled();
        expect(isEnabled).toBe(true);
    });

    it('should show success message after submitting email', async () => {
        await LoginPage.goToForgotPassword();

        await ForgotPasswordPage.requestReset(TestUsers.standard.email);

        await driver.pause(2000);

        // Should show success state
        const isSuccess = await ForgotPasswordPage.isSuccessDisplayed();
        expect(isSuccess).toBe(true);

        // Success message should contain expected text
        const message = await ForgotPasswordPage.getSuccessMessage();
        expect(message.toLowerCase()).toContain('reset link');
    });

    it('should show back to login button after success', async () => {
        await LoginPage.goToForgotPassword();

        await ForgotPasswordPage.requestReset(TestUsers.standard.email);

        await driver.pause(2000);

        // Back to login button should be visible
        await expect(ForgotPasswordPage.backToLoginButton).toBeDisplayed();
    });

    it('should return to login screen when back to login is tapped', async () => {
        await LoginPage.goToForgotPassword();

        await ForgotPasswordPage.requestReset(TestUsers.standard.email);

        await driver.pause(2000);

        // Tap back to login
        await ForgotPasswordPage.goBackToLogin();

        await driver.pause(1000);

        // Should be back on login screen
        const isLoginDisplayed = await LoginPage.isDisplayed();
        expect(isLoginDisplayed).toBe(true);
    });
});

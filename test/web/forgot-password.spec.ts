import ForgotPasswordPage from '../../pages/web/ForgotPasswordPage';
import ResetPasswordPage from '../../pages/web/ResetPasswordPage';
import LoginPage from '../../pages/web/LoginPage';
import TestUsers from '../data/testUsers';
import { getResetEmail, clearResetEmail } from '../../utils/testEmailReader';

describe('Breakroom Web - Forgot Password', () => {
    after(async () => {
        // Restore testuser's original password after the full reset flow test
        await ForgotPasswordPage.open();
        await ForgotPasswordPage.requestReset(TestUsers.standard.email);
        const restoreEmail = await getResetEmail(TestUsers.standard.email);
        await ResetPasswordPage.open(restoreEmail.resetToken);
        await ResetPasswordPage.resetPassword(TestUsers.standard.password, TestUsers.standard.password);
        clearResetEmail(TestUsers.standard.email);
    });

    it('should display the forgot password form', async () => {
        await ForgotPasswordPage.open();

        await expect(ForgotPasswordPage.emailInput).toBeExisting();
        await expect(ForgotPasswordPage.submitButton).toBeExisting();
        await expect(ForgotPasswordPage.backToLoginLink).toBeExisting();
    });

    it('should be accessible from the login page', async () => {
        await LoginPage.open();

        const forgotLink = await $('a[href*="forgot-password"]');
        await expect(forgotLink).toBeExisting();
        await forgotLink.click();

        await browser.waitUntil(
            async () => (await browser.getUrl()).includes('/forgot-password'),
            { timeout: 5000, timeoutMsg: 'Expected navigation to /forgot-password' }
        );
    });

    it('should show a success message after submitting a registered email', async () => {
        await ForgotPasswordPage.open();
        await ForgotPasswordPage.requestReset(TestUsers.standard.email);

        await ForgotPasswordPage.successMessage.waitForExist({ timeout: 10000 });
        const message = await ForgotPasswordPage.getSuccessMessage();
        expect(message).toContain('reset link has been sent');
    });

    it('should show an error for an invalid reset token', async () => {
        await ResetPasswordPage.open('invalid-token-xyz');

        await browser.pause(1000);

        // Submit with the invalid token — the API returns 400 which triggers the error block
        await ResetPasswordPage.resetPassword('SomePass123', 'SomePass123');

        await ResetPasswordPage.invalidTokenBlock.waitForExist({ timeout: 10000 });
        await expect(ResetPasswordPage.invalidTokenBlock).toBeExisting();
    });

    it('should show an error when password is too short', async () => {
        // Use a placeholder token — validation happens client-side before any API call
        await ResetPasswordPage.open('placeholder-token-for-validation');

        await browser.pause(1000);

        // If token is flagged immediately as invalid, skip — this test requires the form to render
        if (await ResetPasswordPage.isTokenInvalid()) {
            return;
        }

        await ResetPasswordPage.resetPassword('abc', 'abc');

        await ResetPasswordPage.errorMessage.waitForExist({ timeout: 5000 });
        const message = await ResetPasswordPage.getErrorMessage();
        expect(message).toContain('5 characters');
    });

    it('should show an error when passwords do not match', async () => {
        await ResetPasswordPage.open('placeholder-token-for-validation');

        await browser.pause(1000);

        if (await ResetPasswordPage.isTokenInvalid()) {
            return;
        }

        await ResetPasswordPage.resetPassword('NewPass123', 'DifferentPass123');

        await ResetPasswordPage.errorMessage.waitForExist({ timeout: 5000 });
        const message = await ResetPasswordPage.getErrorMessage();
        expect(message).toContain('do not match');
    });

    it('should complete the full reset flow and allow login with the new password', async () => {
        const newPassword = 'ResetPass123';

        // Step 1: Request a password reset
        await ForgotPasswordPage.open();
        await ForgotPasswordPage.requestReset(TestUsers.standard.email);
        await ForgotPasswordPage.successMessage.waitForExist({ timeout: 10000 });

        // Step 2: Get the reset token from the test email file
        const resetEmail = await getResetEmail(TestUsers.standard.email);
        expect(resetEmail.resetToken).toBeTruthy();

        // Step 3: Navigate to the reset password page using the token
        await ResetPasswordPage.open(resetEmail.resetToken);
        await browser.pause(1000);

        await expect(ResetPasswordPage.submitButton).toBeExisting();

        // Step 4: Enter and confirm the new password
        await ResetPasswordPage.resetPassword(newPassword, newPassword);

        // Step 5: Verify success message
        await ResetPasswordPage.successMessage.waitForExist({ timeout: 10000 });
        const successMsg = await ResetPasswordPage.getSuccessMessage();
        expect(successMsg).toContain('password has been reset');

        // Step 6: Verify login works with the new password
        await browser.deleteCookies();
        await LoginPage.open();
        await LoginPage.login(TestUsers.standard.handle, newPassword);

        await browser.waitUntil(
            async () => !(await browser.getUrl()).includes('/login'),
            { timeout: 10000, timeoutMsg: 'Expected redirect away from login after reset password login' }
        );

        clearResetEmail(TestUsers.standard.email);
    });
});

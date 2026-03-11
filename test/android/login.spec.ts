import LoginPage from '../../pages/android/LoginPage';
import TestUsers from '../data/testUsers';

describe('Breakroom Android - Login', () => {
    beforeEach(async () => {
        await driver.terminateApp('com.cherryblossomdev.breakroom');
        await driver.activateApp('com.cherryblossomdev.breakroom');
        await LoginPage.waitForAppReady();
    });

    it('should display the login screen', async () => {
        const isDisplayed = await LoginPage.isDisplayed();
        expect(isDisplayed).toBe(true);
    });

    it('should show error with invalid credentials', async () => {
        await LoginPage.login(TestUsers.invalid.handle, TestUsers.invalid.password);

        await driver.pause(3000);

        // Should still be on login screen
        const isDisplayed = await LoginPage.isDisplayed();
        expect(isDisplayed).toBe(true);

        // Should show an error message
        const errorText = await LoginPage.getErrorMessage();
        expect(errorText.length).toBeGreaterThan(0);
    });

    it('should login successfully with valid credentials', async () => {
        await LoginPage.login(TestUsers.standard.handle, TestUsers.standard.password);

        await driver.pause(5000);

        // Should no longer be on login screen
        const isLoginDisplayed = await LoginPage.isDisplayed();
        expect(isLoginDisplayed).toBe(false);
    });

    it('should login successfully with admin credentials', async () => {
        await LoginPage.login(TestUsers.admin.handle, TestUsers.admin.password);

        await driver.pause(5000);

        const isLoginDisplayed = await LoginPage.isDisplayed();
        expect(isLoginDisplayed).toBe(false);
    });

    it('should navigate to signup screen', async () => {
        await LoginPage.goToSignup();

        await driver.pause(2000);

        // Login screen should no longer be shown
        const isLoginDisplayed = await LoginPage.isDisplayed();
        expect(isLoginDisplayed).toBe(false);
    });
});

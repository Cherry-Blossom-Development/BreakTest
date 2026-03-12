import LoginPage from '../../pages/ios/LoginPage';
import TestUsers from '../data/testUsers';

const BUNDLE_ID = 'com.cherryblossomdev.Breakroom';

describe('Breakroom iOS - Login', () => {
    beforeEach(async () => {
        // Force full app restart with launch arguments to clear auth state
        try {
            await driver.terminateApp(BUNDLE_ID);
        } catch {
            // App might not be running
        }
        // Use launchApp which re-applies processArguments including CLEAR_AUTH_STATE
        await driver.execute('mobile: launchApp', {
            bundleId: BUNDLE_ID,
            arguments: ['-CLEAR_AUTH_STATE', 'YES', '-TEST_API_URL', 'http://localhost:3001'],
        });
        await LoginPage.waitForAppReady();
    });

    it('should display the login screen', async () => {
        const isDisplayed = await LoginPage.isDisplayed();
        expect(isDisplayed).toBe(true);
    });

    it('should display the app logo', async () => {
        await expect(LoginPage.appLogo).toBeDisplayed();
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

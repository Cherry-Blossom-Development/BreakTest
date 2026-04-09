import LoginPage from '../../pages/ios/LoginPage';
import LogoutPage from '../../pages/ios/LogoutPage';
import TestUsers from '../data/testUsers';

const BUNDLE_ID = 'com.cherryblossomdev.Breakroom';
const TEST_API_URL = process.env.TEST_API_URL || 'https://dev.prosaurus.com';

async function resetAndLogin(handle: string, password: string): Promise<void> {
    // Force full app restart with launch arguments to clear auth state
    try {
        await driver.terminateApp(BUNDLE_ID);
    } catch {
        // App might not be running
    }
    await driver.execute('mobile: launchApp', {
        bundleId: BUNDLE_ID,
        arguments: ['-CLEAR_AUTH_STATE', 'YES', '-TEST_API_URL', TEST_API_URL],
    });
    await LoginPage.waitForScreen(90000);
    await LoginPage.login(handle, password);
    await driver.pause(5000);
}

describe('Breakroom iOS - Logout', () => {
    before(async () => {
        try {
            await driver.terminateApp(BUNDLE_ID);
        } catch {
            // App might not be running
        }
        await driver.pause(2000);
    });

    beforeEach(async () => {
        await resetAndLogin(TestUsers.standard.handle, TestUsers.standard.password);
    });

    it('should show logout option in the menu', async () => {
        const isLogoutVisible = await LogoutPage.isLogoutVisible();
        expect(isLogoutVisible).toBe(true);
    });

    it('should return to login screen after logout', async () => {
        await LogoutPage.logout();
        await driver.pause(3000);

        const isLoginDisplayed = await LoginPage.isDisplayed();
        expect(isLoginDisplayed).toBe(true);
    });

    it('should clear stored credentials so app starts at login after logout', async () => {
        await LogoutPage.logout();
        await driver.pause(3000);

        // Fully restart the app — if token was cleared it should go to login
        await driver.terminateApp(BUNDLE_ID);
        await driver.pause(2000);
        await driver.execute('mobile: launchApp', {
            bundleId: BUNDLE_ID,
            arguments: ['-TEST_API_URL', TEST_API_URL],
        });
        await driver.pause(5000);

        const isLoginDisplayed = await LoginPage.isDisplayed();
        expect(isLoginDisplayed).toBe(true);
    });

    it('should allow login again after logout', async () => {
        await LogoutPage.logout();
        await driver.pause(3000);

        await LoginPage.waitForScreen(30000);
        await LoginPage.login(TestUsers.standard.handle, TestUsers.standard.password);
        await driver.pause(5000);

        const isLoginDisplayed = await LoginPage.isDisplayed();
        expect(isLoginDisplayed).toBe(false);
    });

    it('should logout admin user and return to login screen', async () => {
        // Re-login as admin
        try {
            await driver.terminateApp(BUNDLE_ID);
        } catch {
            // App might not be running
        }
        await driver.execute('mobile: launchApp', {
            bundleId: BUNDLE_ID,
            arguments: ['-CLEAR_AUTH_STATE', 'YES', '-TEST_API_URL', TEST_API_URL],
        });
        await LoginPage.waitForScreen(90000);
        await LoginPage.login(TestUsers.admin.handle, TestUsers.admin.password);
        await driver.pause(5000);

        await LogoutPage.logout();
        await driver.pause(3000);

        const isLoginDisplayed = await LoginPage.isDisplayed();
        expect(isLoginDisplayed).toBe(true);
    });
});

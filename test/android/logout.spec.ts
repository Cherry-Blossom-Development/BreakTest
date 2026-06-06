import LoginPage from '../../pages/android/LoginPage';
import LogoutPage from '../../pages/android/LogoutPage';
import TestUsers from '../data/testUsers';

async function resetAndLogin(handle: string, password: string): Promise<void> {
    await driver.terminateApp('com.cherryblossomdev.breakroom');
    await driver.pause(2000);
    await driver.execute('mobile: clearApp', { appId: 'com.cherryblossomdev.breakroom' });
    await driver.activateApp('com.cherryblossomdev.breakroom');
    await LoginPage.waitForScreen(90000);
    await LoginPage.login(handle, password);
    await driver.pause(3000);
}

describe('Breakroom Android - Logout', () => {
    before(async () => {
        await driver.terminateApp('com.cherryblossomdev.breakroom');
        await driver.pause(2000);
    });

    beforeEach(async () => {
        await resetAndLogin(TestUsers.standard.handle, TestUsers.standard.password);
    });

    it('should show logout option in the navigation drawer', async () => {
        await LogoutPage.menuButton.waitForDisplayed({ timeout: 10000 });
        await LogoutPage.menuButton.click();
        await LogoutPage.drawerLogoutItem.waitForDisplayed({ timeout: 5000 });

        expect(await LogoutPage.drawerLogoutItem.isDisplayed()).toBe(true);

        await driver.back(); // close drawer
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
        await driver.terminateApp('com.cherryblossomdev.breakroom');
        await driver.pause(2000);
        await driver.activateApp('com.cherryblossomdev.breakroom');
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
        await driver.execute('mobile: clearApp', { appId: 'com.cherryblossomdev.breakroom' });
        await driver.activateApp('com.cherryblossomdev.breakroom');
        await LoginPage.waitForScreen(90000);
        await LoginPage.login(TestUsers.admin.handle, TestUsers.admin.password);
        await driver.pause(5000);

        await LogoutPage.logout();
        await driver.pause(3000);

        const isLoginDisplayed = await LoginPage.isDisplayed();
        expect(isLoginDisplayed).toBe(true);
    });
});

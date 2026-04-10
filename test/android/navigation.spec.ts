import LoginPage from '../../pages/android/LoginPage';
import NavigationPage from '../../pages/android/NavigationPage';
import TestUsers from '../data/testUsers';

async function freshLogin(handle: string, password: string): Promise<void> {
    await driver.execute('mobile: clearApp', { appId: 'com.cherryblossomdev.breakroom' });
    await driver.activateApp('com.cherryblossomdev.breakroom');
    await LoginPage.waitForScreen(90000);
    await LoginPage.login(handle, password);
    await driver.pause(5000);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Pre-auth screens
// ─────────────────────────────────────────────────────────────────────────────
describe('Breakroom Android - Navigation - Pre-Auth Screens', () => {
    before(async () => {
        await driver.execute('mobile: clearApp', { appId: 'com.cherryblossomdev.breakroom' });
        await driver.activateApp('com.cherryblossomdev.breakroom');
        await LoginPage.waitForScreen(90000);
    });

    it('should load the Login screen', async () => {
        await NavigationPage.screenLogin.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenLogin.isDisplayed()).toBe(true);
    });

    it('should load the Signup screen', async () => {
        await LoginPage.goToSignup(30000);
        await NavigationPage.screenSignup.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenSignup.isDisplayed()).toBe(true);
        await driver.back();
    });

    it('should load the Forgot Password screen', async () => {
        await LoginPage.goToForgotPassword();
        await NavigationPage.screenForgotPassword.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenForgotPassword.isDisplayed()).toBe(true);
        await driver.back();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Drawer navigation (authenticated)
// ─────────────────────────────────────────────────────────────────────────────
describe('Breakroom Android - Navigation - Drawer', () => {
    before(async () => {
        await freshLogin(TestUsers.standard.handle, TestUsers.standard.password);
    });

    it('should land on Home screen after login', async () => {
        await NavigationPage.screenHome.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenHome.isDisplayed()).toBe(true);
    });

    it('should navigate to Chat via drawer', async () => {
        await NavigationPage.openDrawerAndTap('Chat');
        await NavigationPage.screenChat.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenChat.isDisplayed()).toBe(true);
    });

    it('should navigate to Friends via drawer', async () => {
        await NavigationPage.openDrawerAndTap('Friends');
        await NavigationPage.screenFriends.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenFriends.isDisplayed()).toBe(true);
    });

    it('should navigate to Blog via drawer', async () => {
        await NavigationPage.openDrawerAndTap('Blog');
        await NavigationPage.screenBlog.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenBlog.isDisplayed()).toBe(true);
    });

    it('should navigate to Profile via drawer', async () => {
        await NavigationPage.openDrawerAndTap('Profile');
        await NavigationPage.screenProfile.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenProfile.isDisplayed()).toBe(true);
    });

    it('should navigate to Tool Shed via drawer', async () => {
        await NavigationPage.openDrawerAndTap('Tool Shed');
        await NavigationPage.screenToolShed.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenToolShed.isDisplayed()).toBe(true);
    });

    it('should navigate to Legal via drawer', async () => {
        await NavigationPage.openDrawerAndTap('Legal');
        await NavigationPage.screenLegal.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenLegal.isDisplayed()).toBe(true);
        await driver.back(); // Legal is a back-stack screen
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Bottom nav navigation (authenticated)
// ─────────────────────────────────────────────────────────────────────────────
describe('Breakroom Android - Navigation - Bottom Nav', () => {
    before(async () => {
        await freshLogin(TestUsers.standard.handle, TestUsers.standard.password);
    });

    it('should navigate to Chat via bottom nav', async () => {
        await NavigationPage.bottomNavChat.waitForDisplayed({ timeout: 10000 });
        await NavigationPage.bottomNavChat.click();
        await NavigationPage.screenChat.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenChat.isDisplayed()).toBe(true);
    });

    it('should navigate to Employment via bottom nav', async () => {
        await NavigationPage.bottomNavEmployment.waitForDisplayed({ timeout: 10000 });
        await NavigationPage.bottomNavEmployment.click();
        await NavigationPage.screenEmployment.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenEmployment.isDisplayed()).toBe(true);
    });

    it('should navigate to Company Portal via bottom nav', async () => {
        await NavigationPage.bottomNavCompanyPortal.waitForDisplayed({ timeout: 10000 });
        await NavigationPage.bottomNavCompanyPortal.click();
        await NavigationPage.screenCompanyPortal.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenCompanyPortal.isDisplayed()).toBe(true);
    });

    it('should navigate to Tool Shed via bottom nav', async () => {
        await NavigationPage.bottomNavToolShed.waitForDisplayed({ timeout: 10000 });
        await NavigationPage.bottomNavToolShed.click();
        await NavigationPage.screenToolShed.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenToolShed.isDisplayed()).toBe(true);
    });

    it('should navigate back to Home via bottom nav', async () => {
        await NavigationPage.bottomNavHome.waitForDisplayed({ timeout: 10000 });
        await NavigationPage.bottomNavHome.click();
        await NavigationPage.screenHome.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenHome.isDisplayed()).toBe(true);
    });
});

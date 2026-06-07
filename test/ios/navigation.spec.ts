import LoginPage from '../../pages/ios/LoginPage';
import NavigationPage from '../../pages/ios/NavigationPage';
import ChatPage from '../../pages/ios/ChatPage';
import EulaPage from '../../pages/ios/EulaPage';
import TestUsers from '../data/testUsers';

const BUNDLE_ID = 'com.cherryblossomdev.Breakroom';
const TEST_API_URL = process.env.TEST_API_URL || 'https://dev.prosaurus.com';

async function freshLogin(handle: string, password: string): Promise<void> {
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

    // Accept EULA if it appears after login
    await EulaPage.acceptIfDisplayed();
}

// -----------------------------------------------------------------------------
// 1. Pre-auth screens
// -----------------------------------------------------------------------------
describe('Breakroom iOS - Navigation - Pre-Auth Screens', () => {
    before(async () => {
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
    });

    it('should load the Login screen', async () => {
        await NavigationPage.screenLogin.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenLogin.isDisplayed()).toBe(true);
    });

    it('should load the Signup screen', async () => {
        await LoginPage.goToSignup();
        await NavigationPage.screenSignup.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenSignup.isDisplayed()).toBe(true);
        await driver.back();
        await driver.pause(500);
    });

    it('should load the Forgot Password screen', async () => {
        await LoginPage.goToForgotPassword();
        await NavigationPage.screenForgotPassword.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenForgotPassword.isDisplayed()).toBe(true);
        await driver.back();
    });
});

// -----------------------------------------------------------------------------
// 2. Menu navigation (authenticated)
// -----------------------------------------------------------------------------
describe('Breakroom iOS - Navigation - Menu', () => {
    before(async () => {
        await freshLogin(TestUsers.standard.handle, TestUsers.standard.password);
    });

    it('should land on Home screen after login', async () => {
        await NavigationPage.screenHome.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenHome.isDisplayed()).toBe(true);
    });

    it('should navigate to Profile via menu', async () => {
        await NavigationPage.goToProfile();
        await NavigationPage.screenProfile.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenProfile.isDisplayed()).toBe(true);
        await driver.back();
        await driver.pause(500);
    });

    it('should navigate to Friends via menu', async () => {
        await NavigationPage.goToFriends();
        await NavigationPage.screenFriends.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenFriends.isDisplayed()).toBe(true);
        await driver.back();
        await driver.pause(500);
    });

    it('should navigate to Blog via menu', async () => {
        await NavigationPage.goToBlog();
        await NavigationPage.screenBlog.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenBlog.isDisplayed()).toBe(true);
        await driver.back();
        await driver.pause(500);
    });

    it('should navigate to Legal via menu', async () => {
        await NavigationPage.goToLegal();
        await NavigationPage.screenLegal.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenLegal.isDisplayed()).toBe(true);
        await driver.back();
        await driver.pause(500);
    });

    it('should navigate to Chat via menu', async () => {
        await NavigationPage.goToChatViaMenu();
        // Chat screen is verified by presence of room items, not a screenChat identifier
        await ChatPage.waitForRoomList(15000);
        const isOnChatScreen = await ChatPage.isRoomListDisplayed();
        expect(isOnChatScreen).toBe(true);
    });
});

// -----------------------------------------------------------------------------
// 3. Tab bar navigation (authenticated)
// -----------------------------------------------------------------------------
describe('Breakroom iOS - Navigation - Tab Bar', () => {
    before(async () => {
        await freshLogin(TestUsers.standard.handle, TestUsers.standard.password);
    });

    it('should navigate to Chat via tab bar', async () => {
        await NavigationPage.tabChat.waitForDisplayed({ timeout: 10000 });
        await NavigationPage.tabChat.click();
        // Chat screen is verified by presence of room items, not a screenChat identifier
        await ChatPage.waitForRoomList(15000);
        const isOnChatScreen = await ChatPage.isRoomListDisplayed();
        expect(isOnChatScreen).toBe(true);
    });

    it('should navigate to Jobs via tab bar', async () => {
        await NavigationPage.tabJobs.waitForDisplayed({ timeout: 10000 });
        await NavigationPage.tabJobs.click();
        await NavigationPage.screenEmployment.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenEmployment.isDisplayed()).toBe(true);
    });

    it('should navigate to Company via tab bar', async () => {
        await NavigationPage.tabCompany.waitForDisplayed({ timeout: 10000 });
        await NavigationPage.tabCompany.click();
        await NavigationPage.screenCompanyPortal.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenCompanyPortal.isDisplayed()).toBe(true);
    });

    it('should navigate to Tool Shed via tab bar', async () => {
        await NavigationPage.tabToolShed.waitForDisplayed({ timeout: 10000 });
        await NavigationPage.tabToolShed.click();
        await NavigationPage.screenToolShed.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenToolShed.isDisplayed()).toBe(true);
    });

    it('should navigate back to Home via tab bar', async () => {
        await NavigationPage.tabBreakroom.waitForDisplayed({ timeout: 10000 });
        await NavigationPage.tabBreakroom.click();
        await NavigationPage.screenHome.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenHome.isDisplayed()).toBe(true);
    });
});

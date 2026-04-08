import LoginPage from '../../pages/web/LoginPage';
import LogoutPage from '../../pages/web/LogoutPage';
import TestUsers from '../data/testUsers';

async function loginAndNavigate(handle: string, password: string): Promise<void> {
    await browser.setWindowSize(1280, 800);
    await browser.deleteCookies();
    await LoginPage.open();
    await LoginPage.login(handle, password);
    await browser.pause(3000);
    // Ensure we're on an authenticated page with the sidebar rendered
    const url = await browser.getUrl();
    if (url.includes('login') || url.includes('about')) {
        throw new Error(`Login failed — still on: ${url}`);
    }
}

describe('Breakroom Web - Logout', () => {
    beforeEach(async () => {
        await loginAndNavigate(TestUsers.standard.handle, TestUsers.standard.password);
    });

    it('should display the logout link when authenticated', async () => {
        await LogoutPage.logoutLink.waitForExist({ timeout: 5000 });
        expect(await LogoutPage.logoutLink.isExisting()).toBe(true);
    });

    it('should redirect away from authenticated area after logout', async () => {
        const beforeUrl = await browser.getUrl();
        await LogoutPage.logout();
        await browser.pause(2000);

        const afterUrl = await browser.getUrl();
        // App redirects to '/' (home) after logout — not staying on the previous page
        expect(afterUrl).not.toBe(beforeUrl);
        expect(afterUrl).not.toContain('/breakroom');
        expect(afterUrl).not.toContain('/chat');
    });

    it('should remove the authenticated UI after logout', async () => {
        await LogoutPage.logout();
        await browser.pause(2000);

        // Sidebar and logout link are gated by v-if="user.username" — must be gone
        expect(await LogoutPage.logoutLink.isExisting()).toBe(false);
    });

    it('should clear the JWT cookie on logout', async () => {
        await LogoutPage.logout();
        await browser.pause(2000);

        const cookies = await browser.getCookies(['jwtToken']);
        expect(cookies.length).toBe(0);
    });

    it('should allow login again after logout', async () => {
        await LogoutPage.logout();
        await browser.pause(2000);

        await LoginPage.open();
        await LoginPage.login(TestUsers.standard.handle, TestUsers.standard.password);
        await browser.pause(3000);

        const url = await browser.getUrl();
        expect(url).not.toContain('login');
    });

    it('should logout admin user and redirect away from authenticated area', async () => {
        await browser.setWindowSize(1280, 800);
        await browser.deleteCookies();
        await LoginPage.open();
        await LoginPage.login(TestUsers.admin.handle, TestUsers.admin.password);
        await browser.pause(3000);

        await LogoutPage.logout();
        await browser.pause(2000);

        const url = await browser.getUrl();
        expect(url).not.toContain('/breakroom');
        expect(url).not.toContain('/admin');
    });
});

import LoginPage from '../../pages/web/LoginPage';
import NavigationPage from '../../pages/web/NavigationPage';
import TestUsers from '../data/testUsers';

// ─────────────────────────────────────────────────────────────
// Helper: clear session so each group starts from a known state
// ─────────────────────────────────────────────────────────────
async function clearSession(): Promise<void> {
    await browser.deleteCookies();
    await browser.url('/login');
    await browser.pause(1000);
}

async function loginAs(handle: string, password: string): Promise<void> {
    await LoginPage.open();
    await LoginPage.login(handle, password);
    await browser.pause(3000); // wait for redirect after login
}

// ─────────────────────────────────────────────────────────────
// 1. Public Pages (no authentication required)
// ─────────────────────────────────────────────────────────────
describe('Breakroom Web - Navigation - Public Pages', () => {
    before(async () => {
        await clearSession();
    });

    it('should load /about', async () => {
        await NavigationPage.navigateTo('/about');
        await NavigationPage.assertPageLoaded('/about');
    });

    it('should load /login', async () => {
        await NavigationPage.navigateTo('/login');
        await NavigationPage.assertPageLoaded('/login');
    });

    it('should load /signup', async () => {
        await NavigationPage.navigateTo('/signup');
        await NavigationPage.assertPageLoaded('/signup');
    });

    it('should load /forgot-password', async () => {
        await NavigationPage.navigateTo('/forgot-password');
        await NavigationPage.assertPageLoaded('/forgot-password');
    });

    it('should load /privacy', async () => {
        await NavigationPage.navigateTo('/privacy');
        await NavigationPage.assertPageLoaded('/privacy');
    });

    it('should load /eula', async () => {
        await NavigationPage.navigateTo('/eula');
        await NavigationPage.assertPageLoaded('/eula');
    });

    it('should load /child-safety', async () => {
        await NavigationPage.navigateTo('/child-safety');
        await NavigationPage.assertPageLoaded('/child-safety');
    });
});

// ─────────────────────────────────────────────────────────────
// 2. Authenticated Pages (login as standard user)
// ─────────────────────────────────────────────────────────────
describe('Breakroom Web - Navigation - Authenticated Pages', () => {
    before(async () => {
        await clearSession();
        await loginAs(TestUsers.standard.handle, TestUsers.standard.password);
    });

    it('should load /breakroom', async () => {
        await NavigationPage.navigateTo('/breakroom');
        await NavigationPage.assertPageLoaded('/breakroom');
    });

    it('should load /chat', async () => {
        await NavigationPage.navigateTo('/chat');
        await NavigationPage.assertPageLoaded('/chat');
    });

    it('should load /blog', async () => {
        await NavigationPage.navigateTo('/blog');
        await NavigationPage.assertPageLoaded('/blog');
    });

    it('should load /friends', async () => {
        await NavigationPage.navigateTo('/friends');
        await NavigationPage.assertPageLoaded('/friends');
    });

    it('should load /about-company', async () => {
        await NavigationPage.navigateTo('/about-company');
        await NavigationPage.assertPageLoaded('/about-company');
    });

    it('should load /employment', async () => {
        await NavigationPage.navigateTo('/employment');
        await NavigationPage.assertPageLoaded('/employment');
    });

    it('should load /help-desk', async () => {
        await NavigationPage.navigateTo('/help-desk');
        await NavigationPage.assertPageLoaded('/help-desk');
    });

    it('should load /company-portal', async () => {
        await NavigationPage.navigateTo('/company-portal');
        await NavigationPage.assertPageLoaded('/company-portal');
    });

    it('should load /tool-shed', async () => {
        await NavigationPage.navigateTo('/tool-shed');
        await NavigationPage.assertPageLoaded('/tool-shed');
    });

    it('should load /lyrics', async () => {
        await NavigationPage.navigateTo('/lyrics');
        await NavigationPage.assertPageLoaded('/lyrics');
    });

    it('should load /sessions', async () => {
        await NavigationPage.navigateTo('/sessions');
        await NavigationPage.assertPageLoaded('/sessions');
    });

    it('should load /kanban', async () => {
        await NavigationPage.navigateTo('/kanban');
        await NavigationPage.assertPageLoaded('/kanban');
    });

    it('should load /art-gallery', async () => {
        await NavigationPage.navigateTo('/art-gallery');
        await NavigationPage.assertPageLoaded('/art-gallery');
    });

    it('should load /profile', async () => {
        await NavigationPage.navigateTo('/profile');
        await NavigationPage.assertPageLoaded('/profile');
    });

    it('should load /profile/settings', async () => {
        await NavigationPage.navigateTo('/profile/settings');
        await NavigationPage.assertPageLoaded('/profile/settings');
    });

    it('should load /profile/billing', async () => {
        await NavigationPage.navigateTo('/profile/billing');
        await NavigationPage.assertPageLoaded('/profile/billing');
    });

    it('should load /profile/legal', async () => {
        await NavigationPage.navigateTo('/profile/legal');
        await NavigationPage.assertPageLoaded('/profile/legal');
    });
});

// ─────────────────────────────────────────────────────────────
// 3. Admin Pages (login as admin user)
// ─────────────────────────────────────────────────────────────
describe('Breakroom Web - Navigation - Admin Pages', () => {
    before(async () => {
        await clearSession();
        await loginAs(TestUsers.admin.handle, TestUsers.admin.password);
    });

    it('should load /admin/users', async () => {
        await NavigationPage.navigateTo('/admin/users');
        await NavigationPage.assertPageLoaded('/admin/users');
    });

    it('should load /admin/groups', async () => {
        await NavigationPage.navigateTo('/admin/groups');
        await NavigationPage.assertPageLoaded('/admin/groups');
    });

    it('should load /admin/permissions', async () => {
        await NavigationPage.navigateTo('/admin/permissions');
        await NavigationPage.assertPageLoaded('/admin/permissions');
    });

    it('should load /admin/notifications', async () => {
        await NavigationPage.navigateTo('/admin/notifications');
        await NavigationPage.assertPageLoaded('/admin/notifications');
    });

    it('should load /admin/billing', async () => {
        await NavigationPage.navigateTo('/admin/billing');
        await NavigationPage.assertPageLoaded('/admin/billing');
    });

    it('should load /admin/system-emails', async () => {
        await NavigationPage.navigateTo('/admin/system-emails');
        await NavigationPage.assertPageLoaded('/admin/system-emails');
    });

    it('should load /admin/test-results', async () => {
        await NavigationPage.navigateTo('/admin/test-results');
        await NavigationPage.assertPageLoaded('/admin/test-results');
    });

    it('should load /admin/features', async () => {
        await NavigationPage.navigateTo('/admin/features');
        await NavigationPage.assertPageLoaded('/admin/features');
    });

    it('should load /admin/moderation', async () => {
        await NavigationPage.navigateTo('/admin/moderation');
        await NavigationPage.assertPageLoaded('/admin/moderation');
    });
});

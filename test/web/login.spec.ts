import LoginPage from '../../pages/web/LoginPage';
import TestUsers from '../data/testUsers';

describe('Breakroom Web - Login', () => {
    beforeEach(async () => {
        await browser.deleteCookies();
        await LoginPage.open();
    });

    it('should display the login form', async () => {
        // Wait for the form elements to be present
        await LoginPage.usernameInput.waitForExist();
        await LoginPage.passwordInput.waitForExist();
        await LoginPage.loginButton.waitForExist();

        // Verify form elements exist
        expect(await LoginPage.usernameInput.isExisting()).toBe(true);
        expect(await LoginPage.passwordInput.isExisting()).toBe(true);
        expect(await LoginPage.loginButton.isExisting()).toBe(true);
    });

    it('should show error with invalid credentials', async () => {
        await LoginPage.login(TestUsers.invalid.handle, TestUsers.invalid.password);

        // Wait for error message or redirect
        await browser.pause(2000);

        // Check we're still on login page (login failed)
        const url = await LoginPage.getUrl();
        expect(url).toContain('login');
    });

    it('should login successfully with valid credentials', async () => {
        await LoginPage.login(TestUsers.standard.handle, TestUsers.standard.password);

        // Wait for redirect after successful login
        await browser.pause(3000);

        // Verify we're redirected away from login page
        const url = await LoginPage.getUrl();
        expect(url).not.toContain('login');
    });

    it('should login successfully with admin credentials', async () => {
        await LoginPage.login(TestUsers.admin.handle, TestUsers.admin.password);

        // Wait for redirect after successful login
        await browser.pause(3000);

        // Verify we're redirected away from login page
        const url = await LoginPage.getUrl();
        expect(url).not.toContain('login');
    });

    it('should navigate to signup page', async () => {
        await LoginPage.goToSignup();

        await browser.pause(1000);

        const url = await LoginPage.getUrl();
        expect(url).toContain('signup');
    });
});

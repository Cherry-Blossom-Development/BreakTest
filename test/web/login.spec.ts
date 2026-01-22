import LoginPage from '../../pages/web/LoginPage';

describe('Breakroom Web - Login', () => {
    beforeEach(async () => {
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
        await LoginPage.login('invalid@example.com', 'wrongpassword');

        // Wait for error message or redirect
        await browser.pause(2000);

        // Check we're still on login page (login failed)
        const url = await LoginPage.getUrl();
        expect(url).toContain('login');
    });

    // Requires TEST_USERNAME and TEST_PASSWORD environment variables
    // Skip if credentials are not configured
    it('should login successfully with valid credentials', async function () {
        const username = process.env.TEST_USERNAME;
        const password = process.env.TEST_PASSWORD;

        if (!username || !password) {
            this.skip();
            return;
        }

        await LoginPage.login(username, password);

        // Wait for redirect after successful login
        await browser.pause(3000);

        // Verify we're redirected away from login page
        const url = await LoginPage.getUrl();
        expect(url).not.toContain('login');
    });

    // Note: Signup link is not present on current login page
    // This test is skipped until signup link is added
    it.skip('should navigate to signup page', async () => {
        await LoginPage.goToSignup();

        await browser.pause(1000);

        const url = await LoginPage.getUrl();
        expect(url).toContain('signup');
    });
});

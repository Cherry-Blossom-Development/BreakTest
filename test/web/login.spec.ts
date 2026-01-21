import LoginPage from '../../pages/web/LoginPage';

describe('Breakroom Web - Login', () => {
    beforeEach(async () => {
        await LoginPage.open();
    });

    it('should display the login form', async () => {
        const isDisplayed = await LoginPage.isDisplayed();
        expect(isDisplayed).toBe(true);
    });

    it('should show error with invalid credentials', async () => {
        await LoginPage.login('invalid@example.com', 'wrongpassword');

        // Wait for error message or redirect
        await browser.pause(2000);

        // Check we're still on login page (login failed)
        const url = await LoginPage.getUrl();
        expect(url).toContain('login');
    });

    it('should login successfully with valid credentials', async () => {
        // Use environment variables or test data for credentials
        const username = process.env.TEST_USERNAME || 'testuser@example.com';
        const password = process.env.TEST_PASSWORD || 'testpassword';

        await LoginPage.login(username, password);

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

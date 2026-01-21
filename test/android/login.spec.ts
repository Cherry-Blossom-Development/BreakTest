import LoginPage from '../../pages/android/LoginPage';

describe('Breakroom Android - Login', () => {
    beforeEach(async () => {
        // Wait for app to load
        await driver.pause(3000);
    });

    it('should display the login screen', async () => {
        const isDisplayed = await LoginPage.isDisplayed();
        expect(isDisplayed).toBe(true);
    });

    it('should show error with invalid credentials', async () => {
        await LoginPage.login('invalid@example.com', 'wrongpassword');

        // Wait for error response
        await driver.pause(3000);

        // Verify we're still on login screen
        const isDisplayed = await LoginPage.isDisplayed();
        expect(isDisplayed).toBe(true);
    });

    it('should login successfully with valid credentials', async () => {
        // Use environment variables or test data for credentials
        const username = process.env.TEST_USERNAME || 'testuser@example.com';
        const password = process.env.TEST_PASSWORD || 'testpassword';

        await LoginPage.login(username, password);

        // Wait for login to complete
        await driver.pause(5000);

        // Verify we're no longer on login screen (logged in successfully)
        const isLoginDisplayed = await LoginPage.isDisplayed();
        expect(isLoginDisplayed).toBe(false);
    });

    it('should navigate to signup screen', async () => {
        await LoginPage.goToSignup();

        // Wait for navigation
        await driver.pause(2000);

        // Verify login screen is no longer displayed
        const isLoginDisplayed = await LoginPage.isDisplayed();
        expect(isLoginDisplayed).toBe(false);
    });
});

import LoginPage from '../../pages/android/LoginPage';
import SignupPage from '../../pages/android/SignupPage';

describe('Breakroom Android - Signup', () => {
    const timestamp = Date.now();
    const testUser = {
        handle: `testsignup_${timestamp}`,
        firstName: 'Test',
        lastName: 'Signup',
        email: `testsignup_${timestamp}@test.local`,
        password: 'TestPass123'
    };

    beforeEach(async () => {
        await driver.terminateApp('com.cherryblossomdev.breakroom');
        await driver.activateApp('com.cherryblossomdev.breakroom');
        await LoginPage.waitForAppReady();
        await LoginPage.goToSignup();
        await SignupPage.waitForScreen();
    });

    it('should display the signup screen', async () => {
        const isDisplayed = await SignupPage.isDisplayed();
        expect(isDisplayed).toBe(true);

        await expect(SignupPage.handleInput).toBeDisplayed();
        await expect(SignupPage.firstNameInput).toBeDisplayed();
        await expect(SignupPage.lastNameInput).toBeDisplayed();
        await expect(SignupPage.emailInput).toBeDisplayed();
        await expect(SignupPage.passwordInput).toBeDisplayed();
        await expect(SignupPage.confirmPasswordInput).toBeDisplayed();
        await expect(SignupPage.createAccountButton).toBeDisplayed();
    });

    it('should complete signup successfully', async () => {
        await SignupPage.signup(
            testUser.handle,
            testUser.firstName,
            testUser.lastName,
            testUser.email,
            testUser.password
        );

        await driver.pause(5000);

        // After signup, user should be auto-logged in and leave the signup screen
        const isSignupDisplayed = await SignupPage.isDisplayed();
        expect(isSignupDisplayed).toBe(false);
    });

    it('should show error for duplicate handle', async () => {
        // Use an existing handle from seeded test data
        await SignupPage.signup(
            'testuser',
            'Another',
            'User',
            `another_${timestamp}@test.local`,
            testUser.password
        );

        await driver.pause(3000);

        const errorText = await SignupPage.getErrorMessage();
        expect(errorText.length).toBeGreaterThan(0);
    });

    it('should navigate back to login screen', async () => {
        await SignupPage.goToLogin();

        await driver.pause(2000);

        const isLoginDisplayed = await LoginPage.isDisplayed();
        expect(isLoginDisplayed).toBe(true);
    });
});

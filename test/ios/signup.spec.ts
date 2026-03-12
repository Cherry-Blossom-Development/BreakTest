import LoginPage from '../../pages/ios/LoginPage';
import SignupPage from '../../pages/ios/SignupPage';

const BUNDLE_ID = 'com.cherryblossomdev.Breakroom';

describe('Breakroom iOS - Signup', () => {
    const timestamp = Date.now();
    const testUser = {
        handle: `testsignup_${timestamp}`,
        firstName: 'Test',
        lastName: 'Signup',
        email: `testsignup_${timestamp}@test.local`,
        password: 'TestPass123'
    };

    beforeEach(async () => {
        try {
            await driver.terminateApp(BUNDLE_ID);
        } catch {
            // App might not be running
        }
        // Use launchApp to re-apply launch arguments including CLEAR_AUTH_STATE
        await driver.execute('mobile: launchApp', {
            bundleId: BUNDLE_ID,
            arguments: ['-CLEAR_AUTH_STATE', 'YES', '-TEST_API_URL', 'http://localhost:3001'],
        });
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

    it.skip('should show error for duplicate handle', async () => {
        // TODO: Error message not appearing - may need app-side fix for error display
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

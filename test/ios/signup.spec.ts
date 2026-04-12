import LoginPage from '../../pages/ios/LoginPage';
import SignupPage from '../../pages/ios/SignupPage';

const BUNDLE_ID = 'com.cherryblossomdev.Breakroom';
const TEST_API_URL = process.env.TEST_API_URL || 'https://dev.prosaurus.com';

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
        await driver.execute('mobile: launchApp', {
            bundleId: BUNDLE_ID,
            arguments: ['-CLEAR_AUTH_STATE', 'YES', '-TEST_API_URL', TEST_API_URL],
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

    it('should show error for duplicate handle', async () => {
        // Use an existing handle from test data
        await SignupPage.signup(
            'testuser',
            'Another',
            'User',
            `another_${timestamp}@test.local`,
            testUser.password
        );

        // Wait for API response
        await driver.pause(3000);

        // For duplicate handle, user should remain on signup screen (not auto-logged in)
        // The app should either show an error or prevent navigation away from signup
        const isStillOnSignup = await SignupPage.isDisplayed();

        // If still on signup, try to find error message
        if (isStillOnSignup) {
            // Try scrolling to see error if it's below the fold
            try {
                await driver.execute('mobile: scroll', { direction: 'down' });
            } catch {
                // Scroll might not work, that's ok
            }
            await driver.pause(500);
        }

        // Test passes if: we stayed on signup (indicating failure) OR we can find an error
        const errorText = await SignupPage.getErrorMessage();
        const hasErrorOrBlocked = isStillOnSignup || errorText.length > 0;
        expect(hasErrorOrBlocked).toBe(true);
    });

    it('should navigate back to login screen', async () => {
        await SignupPage.goToLogin();

        await driver.pause(2000);

        const isLoginDisplayed = await LoginPage.isDisplayed();
        expect(isLoginDisplayed).toBe(true);
    });
});

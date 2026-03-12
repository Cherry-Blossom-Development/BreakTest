import SignupPage from '../../pages/web/SignupPage';
import { getTestEmail, clearTestEmail } from '../../utils/testEmailReader';

describe('Breakroom Web - Signup', () => {
    // Generate unique user for each test run to avoid conflicts
    const timestamp = Date.now();
    const testUser = {
        handle: `testsignup_${timestamp}`,
        firstName: 'Test',
        lastName: 'Signup',
        email: `testsignup_${timestamp}@test.local`,
        password: 'TestPass123'
    };

    after(async () => {
        // Cleanup test email file after all tests
        clearTestEmail(testUser.email);
    });

    it('should display the signup form', async () => {
        await SignupPage.open();

        // Wait for form to be present
        await $('form').waitForExist({ timeout: 10000 });

        // Wait for inputs to be available
        await browser.waitUntil(
            async () => {
                const inputs = [...await $$('form input[type="text"]')];
                return inputs.length >= 4;
            },
            { timeout: 10000, timeoutMsg: 'Expected 4 text inputs on signup form' }
        );

        const textInputs = await $$('form input[type="text"]');
        const passwordInputs = await $$('form input[type="password"]');

        expect(textInputs.length).toBe(4); // handle, first_name, last_name, email
        expect(passwordInputs.length).toBe(2); // password, password2
        await expect(SignupPage.submitButton).toBeExisting();
    });

    it('should complete signup and verify email', async () => {
        await SignupPage.open();

        // Fill and submit signup form
        // Backend writes email to file when NODE_ENV=test
        await SignupPage.signup(
            testUser.handle,
            testUser.firstName,
            testUser.lastName,
            testUser.email,
            testUser.password
        );

        // Wait for redirect to /breakroom (auto-login after signup)
        await browser.waitUntil(
            async () => (await browser.getUrl()).includes('/breakroom'),
            { timeout: 10000, timeoutMsg: 'Expected redirect to /breakroom after signup' }
        );

        // Get verification email from test file
        const email = await getTestEmail(testUser.email);
        expect(email.verificationToken).toBeTruthy();

        // Navigate to verification URL
        const verifyUrl = `${browser.options.baseUrl}/verify?token=${email.verificationToken}`;
        await browser.url(verifyUrl);

        // Wait for page to load and verification to complete
        await browser.pause(3000);

        // Check what's on the page for debugging
        const h2Elements = [...await $$('h2')];
        let headingText = '';
        if (h2Elements.length > 0) {
            headingText = await h2Elements[0].getText();
        }

        // Check for error message
        let errorText = '';
        const errorMessage = await $('.error-message');
        if (await errorMessage.isExisting()) {
            errorText = await errorMessage.getText();
        }

        // The "Go to Breakroom" link only appears after successful verification
        const breakroomLink = await $('a[href="/breakroom"]');
        const linkExists = await breakroomLink.isExisting();

        if (!linkExists) {
            // Fail with helpful debug info including the actual error
            throw new Error(`Verification failed. Heading: "${headingText}". Error: "${errorText}". Token used: ${email.verificationToken}`);
        }

        await expect(breakroomLink).toBeExisting();
    });

    it('should show error for duplicate handle', async () => {
        // Use the user created in previous test
        await SignupPage.open();
        await SignupPage.signup(
            testUser.handle,  // Same handle as previous test
            'Another',
            'User',
            `another_${timestamp}@test.local`,
            testUser.password
        );

        // Should show error message
        const errorMsg = await SignupPage.getErrorMessage();
        expect(errorMsg).toContain('already');
    });

    it('should have submit button for form submission', async () => {
        await SignupPage.open();

        // Wait for form to load
        await $('form').waitForExist({ timeout: 10000 });

        // Verify submit button exists (disabled on empty form by design via isFormValid)
        const submitButton = await $('button[type="submit"]');
        await expect(submitButton).toBeExisting();
    });
});

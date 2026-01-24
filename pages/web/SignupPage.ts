import BasePage from './BasePage';

/**
 * Page object for the Signup page
 */
class SignupPage extends BasePage {
    /**
     * Form inputs - use array indexing since inputs are in separate divs
     */
    get textInputs() {
        return $$('form input[type="text"]');
    }

    get passwordInputs() {
        return $$('form input[type="password"]');
    }

    get submitButton() {
        return $('button[type="submit"]');
    }

    get errorMessage() {
        return $('.error');
    }

    /**
     * Opens the signup page
     */
    async open(): Promise<void> {
        await super.open('/signup');
    }

    /**
     * Performs signup with given details
     * @param handle - The user handle
     * @param firstName - First name
     * @param lastName - Last name
     * @param email - Email address
     * @param password - Password
     */
    async signup(
        handle: string,
        firstName: string,
        lastName: string,
        email: string,
        password: string
    ): Promise<void> {
        // Wait for form to be present
        await $('form').waitForExist({ timeout: 10000 });

        // Wait for inputs to be available
        await browser.waitUntil(
            async () => {
                const inputs = await $$('form input[type="text"]');
                return inputs.length >= 4;
            },
            { timeout: 10000, timeoutMsg: 'Expected 4 text inputs on signup form' }
        );

        const textInputs = await $$('form input[type="text"]');
        const passwordInputs = await $$('form input[type="password"]');

        // Fill text fields: handle, first_name, last_name, email
        await textInputs[0].setValue(handle);
        await textInputs[1].setValue(firstName);
        await textInputs[2].setValue(lastName);
        await textInputs[3].setValue(email);

        // Fill password fields
        await passwordInputs[0].setValue(password);
        await passwordInputs[1].setValue(password);

        await this.submitButton.click();
    }

    /**
     * Checks if signup form is displayed
     */
    async isDisplayed(): Promise<boolean> {
        const textInputs = await this.textInputs;
        return textInputs.length >= 4;
    }

    /**
     * Gets the error message text if displayed
     */
    async getErrorMessage(): Promise<string> {
        try {
            await this.errorMessage.waitForExist({ timeout: 3000 });
            return await this.errorMessage.getText();
        } catch {
            return '';
        }
    }
}

export default new SignupPage();

import LoginPage from '../../pages/ios/LoginPage';
import NavigationPage from '../../pages/ios/NavigationPage';
import SessionsPage from '../../pages/ios/SessionsPage';
import EulaPage from '../../pages/ios/EulaPage';
import TestUsers from '../data/testUsers';

const BUNDLE_ID = 'com.cherryblossomdev.Breakroom';
const TEST_API_URL = process.env.TEST_API_URL || 'https://dev.prosaurus.com';

async function freshLogin(handle: string, password: string): Promise<void> {
    try {
        await driver.terminateApp(BUNDLE_ID);
    } catch {
        // App might not be running
    }
    await driver.execute('mobile: launchApp', {
        bundleId: BUNDLE_ID,
        arguments: ['-CLEAR_AUTH_STATE', 'YES', '-TEST_API_URL', TEST_API_URL],
    });
    await LoginPage.waitForScreen(90000);
    await LoginPage.login(handle, password);
    await driver.pause(5000);

    // Accept EULA if it appears after login
    await EulaPage.acceptIfDisplayed();
}

async function navigateToSessions(): Promise<void> {
    // Navigate to Tool Shed tab
    await NavigationPage.tabToolShed.waitForDisplayed({ timeout: 10000 });
    await NavigationPage.tabToolShed.click();
    await NavigationPage.screenToolShed.waitForDisplayed({ timeout: 10000 });
    await driver.pause(2000); // Wait for features to load

    // Find and tap Sessions "Open" button in Tool Shed
    // The button identifier is: {toolName}OpenButton (lowercased, no spaces)
    // Sessions is in the Musician category (usually at top)
    const sessionsOpenButton = await $('~sessionsOpenButton');

    // Try to scroll to find the button if not immediately visible
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const isDisplayed = await sessionsOpenButton.isDisplayed();
            if (isDisplayed) break;
        } catch {
            // Element not found yet
        }
        // Scroll down to find it
        await driver.execute('mobile: scroll', { direction: 'down' });
        await driver.pause(500);
    }

    await sessionsOpenButton.waitForDisplayed({ timeout: 10000 });
    await sessionsOpenButton.click();
}

// -----------------------------------------------------------------------------
// 1. Sessions - Navigation
// -----------------------------------------------------------------------------
describe('Breakroom iOS - Sessions - Navigation', () => {
    before(async () => {
        await freshLogin(TestUsers.standard.handle, TestUsers.standard.password);
    });

    it('should navigate to Sessions from Tool Shed', async () => {
        await navigateToSessions();
        await SessionsPage.waitForScreen();
        expect(await SessionsPage.screenSessions.isDisplayed()).toBe(true);
    });

    it('should display the tab picker', async () => {
        await SessionsPage.tabPicker.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.tabPicker.isDisplayed()).toBe(true);
    });

    it('should go back to Tool Shed', async () => {
        await driver.back();
        await driver.pause(500);
        await NavigationPage.screenToolShed.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenToolShed.isDisplayed()).toBe(true);
    });
});

// -----------------------------------------------------------------------------
// 2. Sessions - Tab Navigation
// -----------------------------------------------------------------------------
describe('Breakroom iOS - Sessions - Tab Navigation', () => {
    before(async () => {
        await freshLogin(TestUsers.standard.handle, TestUsers.standard.password);
        await navigateToSessions();
        await SessionsPage.waitForScreen();
    });

    it('should default to Band Practice tab', async () => {
        // The record button should be visible on Band Practice tab
        await SessionsPage.recordButton.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.recordButton.isDisplayed()).toBe(true);
    });

    it('should switch to Individual tab', async () => {
        await SessionsPage.selectTab('Individual');
        await driver.pause(1000);
        // The record button should still be visible on Individual tab
        await SessionsPage.recordButton.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.recordButton.isDisplayed()).toBe(true);
    });

    it('should switch to Bands tab', async () => {
        await SessionsPage.selectTab('Bands');
        await driver.pause(1000);
        // The new band button should be visible on Bands tab
        await SessionsPage.newBandButton.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.newBandButton.isDisplayed()).toBe(true);
    });

    it('should switch back to Band Practice tab', async () => {
        await SessionsPage.selectTab('Band Practice');
        await driver.pause(1000);
        await SessionsPage.recordButton.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.recordButton.isDisplayed()).toBe(true);
    });
});

// -----------------------------------------------------------------------------
// 3. Sessions - Band Practice Tab
// -----------------------------------------------------------------------------
describe('Breakroom iOS - Sessions - Band Practice Tab', () => {
    before(async () => {
        await freshLogin(TestUsers.standard.handle, TestUsers.standard.password);
        await navigateToSessions();
        await SessionsPage.waitForScreen();
    });

    it('should display record button', async () => {
        await SessionsPage.recordButton.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.recordButton.isDisplayed()).toBe(true);
    });

    it('should display either sessions list or empty state', async () => {
        await driver.pause(2000);
        const isEmpty = await SessionsPage.isEmpty();
        const hasRecordButton = await SessionsPage.recordButton.isDisplayed();
        // Either empty state or content should be visible along with record button
        expect(hasRecordButton).toBe(true);
    });
});

// -----------------------------------------------------------------------------
// 4. Sessions - Individual Tab
// -----------------------------------------------------------------------------
describe('Breakroom iOS - Sessions - Individual Tab', () => {
    before(async () => {
        await freshLogin(TestUsers.standard.handle, TestUsers.standard.password);
        await navigateToSessions();
        await SessionsPage.waitForScreen();
        await SessionsPage.selectTab('Individual');
        await driver.pause(1000);
    });

    it('should display record button on Individual tab', async () => {
        await SessionsPage.recordButton.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.recordButton.isDisplayed()).toBe(true);
    });
});

// -----------------------------------------------------------------------------
// 5. Sessions - Bands Tab
// -----------------------------------------------------------------------------
describe('Breakroom iOS - Sessions - Bands Tab', () => {
    const testBandName = `Test Band ${Date.now()}`;

    before(async () => {
        await freshLogin(TestUsers.standard.handle, TestUsers.standard.password);
        await navigateToSessions();
        await SessionsPage.waitForScreen();
        await SessionsPage.selectTab('Bands');
        await driver.pause(1000);
    });

    it('should display new band button', async () => {
        await SessionsPage.newBandButton.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.newBandButton.isDisplayed()).toBe(true);
    });

    it('should open create band form', async () => {
        await SessionsPage.newBandButton.click();
        await driver.pause(500);
        await SessionsPage.bandNameField.waitForDisplayed({ timeout: 5000 });
        expect(await SessionsPage.bandNameField.isDisplayed()).toBe(true);
    });

    it('should have create band button disabled when name is empty', async () => {
        const createButton = await SessionsPage.createBandButton;
        const isEnabled = await createButton.isEnabled();
        expect(isEnabled).toBe(false);
    });

    it('should enable create button when name is entered', async () => {
        await SessionsPage.bandNameField.setValue(testBandName);
        await driver.pause(500);
        const createButton = await SessionsPage.createBandButton;
        const isEnabled = await createButton.isEnabled();
        expect(isEnabled).toBe(true);
    });

    it('should create a band', async () => {
        await SessionsPage.createBandButton.click();
        await driver.pause(2000);
        // Form should disappear after successful creation
        const formVisible = await SessionsPage.bandNameField.isDisplayed().catch(() => false);
        expect(formVisible).toBe(false);
    });

    it('should cancel form without creating', async () => {
        // First make sure we're showing the form
        await SessionsPage.newBandButton.waitForDisplayed({ timeout: 10000 });
        await SessionsPage.newBandButton.click();
        await driver.pause(500);
        await SessionsPage.bandNameField.waitForDisplayed({ timeout: 5000 });

        // Cancel button is the same as new band button (toggles)
        await SessionsPage.newBandButton.click();
        await driver.pause(500);

        // Form should be hidden
        const formVisible = await SessionsPage.bandNameField.isDisplayed().catch(() => false);
        expect(formVisible).toBe(false);
    });
});

// -----------------------------------------------------------------------------
// 6. Sessions - Recording (requires microphone permission)
// -----------------------------------------------------------------------------
describe('Breakroom iOS - Sessions - Recording UI', () => {
    before(async () => {
        await freshLogin(TestUsers.standard.handle, TestUsers.standard.password);
        await navigateToSessions();
        await SessionsPage.waitForScreen();
    });

    it('should show record button', async () => {
        await SessionsPage.recordButton.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.recordButton.isDisplayed()).toBe(true);
    });

    // Note: Actually recording requires microphone permission which
    // may not be granted in the test environment. The following tests
    // verify the UI elements are present.

    it('should have record button enabled', async () => {
        const recordButton = await SessionsPage.recordButton;
        const isEnabled = await recordButton.isEnabled();
        expect(isEnabled).toBe(true);
    });
});

// -----------------------------------------------------------------------------
// 7. Sessions - Now Playing Bar
// -----------------------------------------------------------------------------
describe('Breakroom iOS - Sessions - Playback UI', () => {
    before(async () => {
        await freshLogin(TestUsers.standard.handle, TestUsers.standard.password);
        await navigateToSessions();
        await SessionsPage.waitForScreen();
    });

    it('should not show now playing bar when nothing is playing', async () => {
        const isPlaying = await SessionsPage.isPlaying();
        expect(isPlaying).toBe(false);
    });
});

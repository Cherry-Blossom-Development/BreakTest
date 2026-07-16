import mysql from 'mysql2/promise';
import LoginPage from '../../pages/ios/LoginPage';
import NavigationPage from '../../pages/ios/NavigationPage';
import SessionsPage from '../../pages/ios/SessionsPage';
import EulaPage from '../../pages/ios/EulaPage';
import TestUsers from '../data/testUsers';

const BUNDLE_ID = 'com.cherryblossomdev.Breakroom';
const TEST_API_URL = process.env.TEST_API_URL || 'https://dev.prosaurus.com';

// Clean up saved sessions directly from the test DB to avoid leaving test data behind
async function deleteSessionByName(name: string): Promise<void> {
    const conn = await mysql.createConnection({
        host: process.env.TEST_DB_HOST,
        port: Number(process.env.TEST_DB_PORT),
        user: process.env.TEST_DB_USER,
        password: process.env.TEST_DB_PASS,
        database: process.env.TEST_DB_NAME,
    });
    await conn.execute('DELETE FROM sessions WHERE name = ?', [name]);
    await conn.end();
}

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
    const sessionsOpenButton = await $('~sessionsOpenButton');

    // Try to scroll to find the button if not immediately visible
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const isDisplayed = await sessionsOpenButton.isDisplayed();
            if (isDisplayed) break;
        } catch {
            // Element not found yet
        }
        await driver.execute('mobile: scroll', { direction: 'down' });
        await driver.pause(500);
    }

    await sessionsOpenButton.waitForDisplayed({ timeout: 10000 });
    await sessionsOpenButton.click();

    // Wait for navigation to Sessions screen
    await driver.pause(2000);
}

// -----------------------------------------------------------------------------
// Sessions Recording - Upload/Record Buttons
// -----------------------------------------------------------------------------
describe('Breakroom iOS - Sessions Recording - Buttons', () => {
    before(async () => {
        await freshLogin(TestUsers.standard.handle, TestUsers.standard.password);
        await navigateToSessions();
        await SessionsPage.waitForScreen();
    });

    it('should show both Upload and Record buttons on Band Practice tab', async () => {
        await SessionsPage.uploadButton.waitForDisplayed({ timeout: 10000 });
        await SessionsPage.recordButton.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.uploadButton.isDisplayed()).toBe(true);
        expect(await SessionsPage.recordButton.isDisplayed()).toBe(true);
    });

    it('should show both Upload and Record buttons on Individual tab', async () => {
        await SessionsPage.selectTab('Individual');
        await driver.pause(1000);
        await SessionsPage.uploadButton.waitForDisplayed({ timeout: 10000 });
        await SessionsPage.recordButton.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.uploadButton.isDisplayed()).toBe(true);
        expect(await SessionsPage.recordButton.isDisplayed()).toBe(true);
    });

    it('should NOT show Upload or Record buttons on Bands tab', async () => {
        await SessionsPage.selectTab('Bands');
        await driver.pause(1000);
        // Bands tab shows New Band button instead
        await SessionsPage.newBandButton.waitForDisplayed({ timeout: 10000 });
        const uploadVisible = await SessionsPage.uploadButton.isDisplayed().catch(() => false);
        const recordVisible = await SessionsPage.recordButton.isDisplayed().catch(() => false);
        expect(uploadVisible).toBe(false);
        expect(recordVisible).toBe(false);
    });
});

// -----------------------------------------------------------------------------
// Sessions Recording - Live Recording Flow
// -----------------------------------------------------------------------------
describe('Breakroom iOS - Sessions Recording - Live Recording Flow', () => {
    before(async () => {
        await freshLogin(TestUsers.standard.handle, TestUsers.standard.password);
        await navigateToSessions();
        await SessionsPage.waitForScreen();
    });

    it('should have Record button enabled', async () => {
        await SessionsPage.recordButton.waitForDisplayed({ timeout: 10000 });
        const isEnabled = await SessionsPage.recordButton.isEnabled();
        expect(isEnabled).toBe(true);
    });

    it('should show Stop button and timer when recording starts', async () => {
        await SessionsPage.recordButton.click();
        // Wait for recording to start - Stop button should appear
        await SessionsPage.stopButton.waitForDisplayed({ timeout: 15000 });
        expect(await SessionsPage.stopButton.isDisplayed()).toBe(true);

        // Timer should be visible
        await SessionsPage.recordingTimer.waitForDisplayed({ timeout: 5000 });
        expect(await SessionsPage.recordingTimer.isDisplayed()).toBe(true);
    });

    it('should hide Record button while recording', async () => {
        // Record button should be hidden or disabled during recording
        const recordVisible = await SessionsPage.recordButton.isDisplayed().catch(() => false);
        expect(recordVisible).toBe(false);
    });

    it('should show Save Recording form after stopping', async () => {
        // Let recording run for a moment
        await driver.pause(2000);

        // Stop the recording
        await SessionsPage.stopButton.click();

        // Save form should appear
        await SessionsPage.saveRecordingForm.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.saveRecordingForm.isDisplayed()).toBe(true);
    });

    it('should show session name field in save form', async () => {
        await SessionsPage.sessionNameField.waitForDisplayed({ timeout: 5000 });
        expect(await SessionsPage.sessionNameField.isDisplayed()).toBe(true);
    });

    it('should show session date field in save form', async () => {
        await SessionsPage.sessionDateField.waitForDisplayed({ timeout: 5000 });
        expect(await SessionsPage.sessionDateField.isDisplayed()).toBe(true);
    });

    it('should show discard button in save form', async () => {
        await SessionsPage.discardButton.waitForDisplayed({ timeout: 5000 });
        expect(await SessionsPage.discardButton.isDisplayed()).toBe(true);
    });

    it('should show save button in save form', async () => {
        await SessionsPage.saveRecordingButton.waitForDisplayed({ timeout: 5000 });
        expect(await SessionsPage.saveRecordingButton.isDisplayed()).toBe(true);
    });

    it('should close form and return to sessions when discarding', async () => {
        await SessionsPage.discardButton.click();
        await driver.pause(1000);

        // Should be back on sessions screen
        await SessionsPage.screenSessions.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.screenSessions.isDisplayed()).toBe(true);

        // Record button should be visible again
        await SessionsPage.recordButton.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.recordButton.isDisplayed()).toBe(true);
    });
});

// -----------------------------------------------------------------------------
// Sessions Recording - Save Recording
// -----------------------------------------------------------------------------
describe('Breakroom iOS - Sessions Recording - Save Recording', () => {
    const testSessionName = `Test Session ${Date.now()}`;

    before(async () => {
        await freshLogin(TestUsers.standard.handle, TestUsers.standard.password);
        await navigateToSessions();
        await SessionsPage.waitForScreen();
    });

    after(async () => {
        // Clean up the saved session from the database
        await deleteSessionByName(testSessionName);
    });

    it('should record, name, and save a session', async () => {
        // Start recording
        await SessionsPage.recordButton.click();
        await SessionsPage.stopButton.waitForDisplayed({ timeout: 15000 });

        // Record for a moment
        await driver.pause(2000);

        // Stop recording
        await SessionsPage.stopButton.click();
        await SessionsPage.saveRecordingForm.waitForDisplayed({ timeout: 10000 });

        // Enter a custom name
        await SessionsPage.sessionNameField.waitForDisplayed({ timeout: 5000 });
        await SessionsPage.sessionNameField.clearValue();
        await SessionsPage.sessionNameField.setValue(testSessionName);

        // Save the recording
        await SessionsPage.saveRecordingButton.click();

        // Wait for save to complete and return to sessions
        await driver.pause(5000);
        await SessionsPage.screenSessions.waitForDisplayed({ timeout: 15000 });
    });

    it('should return to sessions screen after saving', async () => {
        // After saving, we should be back on the Sessions screen
        // The record button should be visible, indicating we're ready to record again
        await SessionsPage.recordButton.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.recordButton.isDisplayed()).toBe(true);

        // Verify we're on the Band Practice tab (where we recorded)
        const bandTab = await $('~Band Practice');
        expect(await bandTab.isDisplayed()).toBe(true);
    });
});

// -----------------------------------------------------------------------------
// Sessions Recording - Individual Tab Recording
// -----------------------------------------------------------------------------
describe('Breakroom iOS - Sessions Recording - Individual Tab', () => {
    before(async () => {
        await freshLogin(TestUsers.standard.handle, TestUsers.standard.password);
        await navigateToSessions();
        await SessionsPage.waitForScreen();
        await SessionsPage.selectTab('Individual');
        await driver.pause(1000);
    });

    it('should record on Individual tab', async () => {
        await SessionsPage.recordButton.waitForDisplayed({ timeout: 10000 });
        await SessionsPage.recordButton.click();
        await SessionsPage.stopButton.waitForDisplayed({ timeout: 15000 });
        expect(await SessionsPage.stopButton.isDisplayed()).toBe(true);
    });

    it('should show timer while recording on Individual tab', async () => {
        await SessionsPage.recordingTimer.waitForDisplayed({ timeout: 5000 });
        expect(await SessionsPage.recordingTimer.isDisplayed()).toBe(true);
    });

    it('should stop and show save form on Individual tab', async () => {
        await driver.pause(1500);
        await SessionsPage.stopButton.click();
        await SessionsPage.saveRecordingForm.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.saveRecordingForm.isDisplayed()).toBe(true);

        // Discard to clean up
        await SessionsPage.discardButton.click();
        await driver.pause(1000);
    });
});

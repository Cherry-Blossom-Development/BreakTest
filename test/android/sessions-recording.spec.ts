import mysql from 'mysql2/promise';
import LoginPage from '../../pages/android/LoginPage';
import NavigationPage from '../../pages/android/NavigationPage';
import SessionsPage from '../../pages/android/SessionsPage';
import TestUsers from '../data/testUsers';

// The Android app has no delete-by-name UI hook available to the test, so a saved
// session is cleaned up directly against the test DB (same DB/credentials the
// wdio config already loaded via TEST_ENV) rather than left behind in breakroom_test.
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

async function loginAndNavigateToSessions(): Promise<void> {
    await driver.terminateApp('com.cherryblossomdev.breakroom');
    await driver.pause(2000);
    await driver.execute('mobile: clearApp', { appId: 'com.cherryblossomdev.breakroom' });
    await driver.activateApp('com.cherryblossomdev.breakroom');
    await LoginPage.waitForScreen(90000);
    await LoginPage.login(TestUsers.standard.handle, TestUsers.standard.password);
    await driver.pause(3000);

    // clearApp resets runtime permissions each cycle (same as the POST_NOTIFICATIONS
    // grant in LoginPage.waitForScreen) — RECORD_AUDIO needs the same treatment so the
    // live-recording flow doesn't stall behind an OS mic-permission dialog.
    await driver.execute('mobile: changePermissions', {
        permissions: ['android.permission.RECORD_AUDIO'],
        action: 'grant',
        appPackage: 'com.cherryblossomdev.breakroom',
    }).catch(() => {});

    await NavigationPage.openDrawerAndTap('Sessions');
    await SessionsPage.waitForScreen(15000);
}

// -----------------------------------------------------------------------------
// Sessions Recording - Upload/Record Buttons
// -----------------------------------------------------------------------------
describe('Breakroom Android - Sessions Recording - Buttons', () => {
    before(async () => {
        await loginAndNavigateToSessions();
    });

    it('should show both Upload and Record buttons on Band Practice tab', async () => {
        await SessionsPage.uploadButton.waitForDisplayed({ timeout: 10000 });
        await SessionsPage.recordButton.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.uploadButton.isDisplayed()).toBe(true);
        expect(await SessionsPage.recordButton.isDisplayed()).toBe(true);
    });

    it('should show both Upload and Record buttons on Individual tab', async () => {
        await SessionsPage.clickTab('Individual');
        await SessionsPage.uploadButton.waitForDisplayed({ timeout: 10000 });
        await SessionsPage.recordButton.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.uploadButton.isDisplayed()).toBe(true);
        expect(await SessionsPage.recordButton.isDisplayed()).toBe(true);
    });

    it('should NOT show Upload or Record buttons on Bands tab', async () => {
        await SessionsPage.clickTab('Bands');
        // Bands tab shows a Create Band button instead
        await SessionsPage.createBandButton.waitForDisplayed({ timeout: 10000 });
        const uploadVisible = await SessionsPage.uploadButton.isDisplayed().catch(() => false);
        const recordVisible = await SessionsPage.recordButton.isDisplayed().catch(() => false);
        expect(uploadVisible).toBe(false);
        expect(recordVisible).toBe(false);
    });
});

// -----------------------------------------------------------------------------
// Sessions Recording - Live Recording Flow
// -----------------------------------------------------------------------------
describe('Breakroom Android - Sessions Recording - Live Recording Flow', () => {
    before(async () => {
        await loginAndNavigateToSessions();
    });

    it('should have Record button enabled', async () => {
        await SessionsPage.recordButton.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.recordButton.isEnabled()).toBe(true);
    });

    it('should show Stop button and timer when recording starts', async () => {
        await SessionsPage.startRecording();
        await SessionsPage.stopButton.waitForDisplayed({ timeout: 15000 });
        expect(await SessionsPage.stopButton.isDisplayed()).toBe(true);
        await SessionsPage.recordingTimer.waitForDisplayed({ timeout: 5000 });
        expect(await SessionsPage.recordingTimer.isDisplayed()).toBe(true);
    });

    it('should hide Record button while recording', async () => {
        const recordVisible = await SessionsPage.recordButton.isDisplayed().catch(() => false);
        expect(recordVisible).toBe(false);
    });

    it('should show Save dialog after stopping', async () => {
        await driver.pause(2000);
        await SessionsPage.stopRecording();
        await SessionsPage.saveDialog.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.saveDialog.isDisplayed()).toBe(true);
    });

    it('should show session name field in the dialog', async () => {
        await SessionsPage.sessionNameField.waitForDisplayed({ timeout: 5000 });
        expect(await SessionsPage.sessionNameField.isDisplayed()).toBe(true);
    });

    it('should show session date field in the dialog', async () => {
        await SessionsPage.sessionDateField.waitForDisplayed({ timeout: 5000 });
        expect(await SessionsPage.sessionDateField.isDisplayed()).toBe(true);
    });

    it('should show discard button in the dialog', async () => {
        await SessionsPage.discardButton.waitForDisplayed({ timeout: 5000 });
        expect(await SessionsPage.discardButton.isDisplayed()).toBe(true);
    });

    it('should show save button in the dialog', async () => {
        await SessionsPage.saveButton.waitForDisplayed({ timeout: 5000 });
        expect(await SessionsPage.saveButton.isDisplayed()).toBe(true);
    });

    it('should close the dialog and return to sessions when discarding', async () => {
        await SessionsPage.discardRecording();
        await driver.pause(1000);
        await SessionsPage.screen.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.screen.isDisplayed()).toBe(true);
        await SessionsPage.recordButton.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.recordButton.isDisplayed()).toBe(true);
    });
});

// -----------------------------------------------------------------------------
// Sessions Recording - Save Recording
// -----------------------------------------------------------------------------
describe('Breakroom Android - Sessions Recording - Save Recording', () => {
    const testSessionName = `Test Session ${Date.now()}`;

    before(async () => {
        await loginAndNavigateToSessions();
    });

    after(async () => {
        await deleteSessionByName(testSessionName);
    });

    it('should record, name, and save a session', async () => {
        await SessionsPage.startRecording();
        await SessionsPage.stopButton.waitForDisplayed({ timeout: 15000 });
        await driver.pause(2000);
        await SessionsPage.stopRecording();
        await SessionsPage.saveDialog.waitForDisplayed({ timeout: 10000 });
        await SessionsPage.saveRecording(testSessionName);
        await driver.pause(5000);
        await SessionsPage.saveDialog.waitForDisplayed({ timeout: 15000, reverse: true });
    });

    it('should return to sessions screen after saving', async () => {
        await SessionsPage.recordButton.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.recordButton.isDisplayed()).toBe(true);
        const bandTab = await $('android=new UiSelector().text("Band Practice")');
        expect(await bandTab.isDisplayed()).toBe(true);
    });
});

// -----------------------------------------------------------------------------
// Sessions Recording - Individual Tab Recording
// -----------------------------------------------------------------------------
describe('Breakroom Android - Sessions Recording - Individual Tab', () => {
    before(async () => {
        await loginAndNavigateToSessions();
        await SessionsPage.clickTab('Individual');
        await driver.pause(1000);
    });

    it('should record on Individual tab', async () => {
        await SessionsPage.startRecording();
        await SessionsPage.stopButton.waitForDisplayed({ timeout: 15000 });
        expect(await SessionsPage.stopButton.isDisplayed()).toBe(true);
    });

    it('should show timer while recording on Individual tab', async () => {
        await SessionsPage.recordingTimer.waitForDisplayed({ timeout: 5000 });
        expect(await SessionsPage.recordingTimer.isDisplayed()).toBe(true);
    });

    it('should stop and show save dialog on Individual tab', async () => {
        await driver.pause(1500);
        await SessionsPage.stopRecording();
        await SessionsPage.saveDialog.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.saveDialog.isDisplayed()).toBe(true);

        // Discard to clean up
        await SessionsPage.discardRecording();
        await driver.pause(1000);
    });
});

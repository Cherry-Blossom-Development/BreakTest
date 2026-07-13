import path from 'path';
import LoginPage from '../../pages/web/LoginPage';
import SessionsPage from '../../pages/web/SessionsPage';
import TestUsers from '../data/testUsers';

const FIXTURE_AUDIO = path.resolve(__dirname, '../data/fixtures/test-recording.wav');

describe('Breakroom Web - Sessions New Recording (upload/record chooser)', () => {
    before(async () => {
        await browser.setWindowSize(1280, 800);
        await browser.deleteCookies();
        await LoginPage.open();
        await LoginPage.login(TestUsers.standard.handle, TestUsers.standard.password);
        await browser.pause(3000);
        const url = await browser.getUrl();
        if (url.includes('login') || url.includes('about')) {
            throw new Error(`Login failed — still on: ${url}`);
        }
    });

    beforeEach(async () => {
        await SessionsPage.open();
        await SessionsPage.container.waitForDisplayed({ timeout: 10000 });
        await SessionsPage.clickTab('Band Practice');
    });

    // ─── Step 1: chooser ────────────────────────────────────────────────────────

    it('should show the Upload/Record chooser by default', async () => {
        await SessionsPage.recordModeChooser.waitForDisplayed({ timeout: 5000 });
        const buttons = await SessionsPage.recordModeButtons;
        expect(buttons.length).toBe(2);
    });

    it('should label the two chooser options', async () => {
        const buttons = await SessionsPage.recordModeButtons;
        const labels: string[] = [];
        for (const btn of buttons) {
            labels.push(await btn.$('.record-mode-label').getText());
        }
        expect(labels).toContain('Upload a Recording');
        expect(labels).toContain('Record a Live Session');
    });

    // ─── Upload flow ─────────────────────────────────────────────────────────────

    it('should show the file picker and a Back button after choosing Upload', async () => {
        await SessionsPage.chooseMode('upload');
        await SessionsPage.uploadFileInput.waitForExist({ timeout: 5000 });
        await SessionsPage.backButton.waitForDisplayed({ timeout: 5000 });
        expect(await SessionsPage.fileLabel.getText()).toBe('Choose audio file…');
    });

    it('should default the rename choice to "keep filename" and hide Name/Date fields', async () => {
        await SessionsPage.chooseMode('upload');
        expect(await SessionsPage.renameChoiceKeepRadio.isSelected()).toBe(true);
        expect(await SessionsPage.nameInput.isExisting()).toBe(false);
    });

    it('should disable Upload until a file is chosen', async () => {
        await SessionsPage.chooseMode('upload');
        expect(await SessionsPage.isUploadButtonDisabled()).toBe(true);
    });

    it('should enable Upload and display the filename once a file is chosen', async () => {
        await SessionsPage.chooseMode('upload');
        await SessionsPage.uploadFileInput.setValue(FIXTURE_AUDIO);
        expect(await SessionsPage.fileLabel.getText()).toBe('test-recording.wav');
        expect(await SessionsPage.isUploadButtonDisabled()).toBe(false);
    });

    it('should reveal Name and Date fields when switching rename choice to "Rename it"', async () => {
        await SessionsPage.chooseMode('upload');
        await SessionsPage.renameChoiceRenameRadio.click();
        await SessionsPage.nameInput.waitForExist({ timeout: 5000 });
        expect(await SessionsPage.nameInput.isExisting()).toBe(true);
    });

    it('should return to the Step 1 chooser when Back is clicked', async () => {
        await SessionsPage.chooseMode('upload');
        await SessionsPage.backButton.click();
        await SessionsPage.recordModeChooser.waitForDisplayed({ timeout: 5000 });
        expect(await SessionsPage.uploadFileInput.isExisting()).toBe(false);
    });

    // ─── Live-record flow ────────────────────────────────────────────────────────
    // Chrome runs with --use-fake-device-for-media-stream / --use-fake-ui-for-media-stream
    // (config/wdio.web.conf.ts) so getUserMedia resolves with a synthetic audio track
    // instead of blocking on a real mic + OS permission prompt.

    it('should show a Record button after choosing "Record a Live Session"', async () => {
        await SessionsPage.chooseMode('record');
        await SessionsPage.recordMicButton.waitForDisplayed({ timeout: 5000 });
        expect(await SessionsPage.recordMicButton.getText()).toContain('Record');
    });

    it('should show a live timer, level meter, and Stop button while recording', async () => {
        await SessionsPage.chooseMode('record');
        await SessionsPage.recordMicButton.click();
        await SessionsPage.stopRecordingButton.waitForDisplayed({ timeout: 10000 });
        expect(await SessionsPage.recIndicator.isDisplayed()).toBe(true);
        expect(await SessionsPage.levelMeter.isDisplayed()).toBe(true);
        await SessionsPage.stopRecordingButton.click();
    });

    it('should show a preview and enable "Save Recording" after stopping', async () => {
        await SessionsPage.chooseMode('record');
        await SessionsPage.recordMicButton.click();
        await SessionsPage.stopRecordingButton.waitForDisplayed({ timeout: 10000 });
        await browser.pause(1500);
        await SessionsPage.stopRecordingButton.click();

        await SessionsPage.recordingPreviewAudio.waitForExist({ timeout: 5000 });
        await SessionsPage.discardButton.waitForDisplayed({ timeout: 5000 });
        expect(await SessionsPage.uploadButton.getText()).toBe('Save Recording');
        expect(await SessionsPage.isUploadButtonDisabled()).toBe(false);
    });

    it('should discard the take and allow recording another one', async () => {
        await SessionsPage.chooseMode('record');
        await SessionsPage.recordMicButton.click();
        await SessionsPage.stopRecordingButton.waitForDisplayed({ timeout: 10000 });
        await browser.pause(1500);
        await SessionsPage.stopRecordingButton.click();

        await SessionsPage.discardButton.waitForDisplayed({ timeout: 5000 });
        await SessionsPage.discardButton.click();

        expect(await SessionsPage.recordingPreviewAudio.isExisting()).toBe(false);
        expect(await SessionsPage.isUploadButtonDisabled()).toBe(true);
        // Still mid-flow (not back at the Step 1 chooser) — ready for another take.
        await SessionsPage.recordMicButton.waitForDisplayed({ timeout: 5000 });
    });

    it('should save a live recording and list it under Your Sessions', async () => {
        await SessionsPage.chooseMode('record');
        await SessionsPage.recordMicButton.click();
        await SessionsPage.stopRecordingButton.waitForDisplayed({ timeout: 10000 });
        await browser.pause(1500);
        await SessionsPage.stopRecordingButton.click();
        await SessionsPage.recordingPreviewAudio.waitForExist({ timeout: 5000 });

        // Recording mode auto-fills a default "Session - <date>" name.
        const sessionName = await SessionsPage.nameInput.getValue();
        expect(sessionName).not.toBe('');

        await SessionsPage.uploadButton.click();
        await SessionsPage.recordModeChooser.waitForDisplayed({ timeout: 10000 });

        const row = await SessionsPage.findSessionRow(sessionName);
        expect(row).not.toBeNull();

        await SessionsPage.deleteSessionRow(sessionName);
    });
});

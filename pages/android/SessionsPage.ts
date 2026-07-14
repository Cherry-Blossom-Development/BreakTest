import BasePage from './BasePage';

class SessionsPage extends BasePage {
    get screen() {
        return this.rid('screen-sessions');
    }

    get bpContent() {
        return this.rid('sessions-bp-content');
    }

    get indContent() {
        return this.rid('sessions-ind-content');
    }

    get bandsContent() {
        return this.rid('sessions-bands-content');
    }

    // ─── Recording controls (Band Practice / Individual header row) ──────────────

    get uploadButton() {
        return this.rid('sessions-upload-button');
    }

    get recordButton() {
        return this.rid('sessions-record-button');
    }

    get stopButton() {
        return this.rid('sessions-stop-button');
    }

    get recordingTimer() {
        return this.rid('sessions-recording-timer');
    }

    // ─── Save/Discard dialog (shown after stopping a recording) ──────────────────

    get saveDialog() {
        return this.rid('sessions-save-dialog');
    }

    get sessionNameField() {
        return this.rid('sessions-session-name-field');
    }

    get sessionDateField() {
        return this.rid('sessions-session-date-field');
    }

    get discardButton() {
        return this.rid('sessions-discard-button');
    }

    get saveButton() {
        return this.rid('sessions-save-button');
    }

    // ─── Bands tab ─────────────────────────────────────────────────────────────

    get createBandButton() {
        return $('android=new UiSelector().text("Create Band")');
    }

    async waitForScreen(timeout = 15000): Promise<void> {
        await this.screen.waitForDisplayed({ timeout });
    }

    async clickTab(tabName: 'Band Practice' | 'Individual' | 'Bands'): Promise<void> {
        const tab = await $(`android=new UiSelector().text("${tabName}")`);
        await tab.waitForDisplayed({ timeout: 5000 });
        await tab.click();
        await driver.pause(500);
    }

    async isTabVisible(tabName: string): Promise<boolean> {
        try {
            const tab = await $(`android=new UiSelector().text("${tabName}")`);
            return await tab.isDisplayed();
        } catch {
            return false;
        }
    }

    async startRecording(): Promise<void> {
        await this.recordButton.waitForDisplayed({ timeout: 10000 });
        await this.recordButton.click();
    }

    async stopRecording(): Promise<void> {
        await this.stopButton.waitForDisplayed({ timeout: 15000 });
        await this.stopButton.click();
    }

    async saveRecording(name: string): Promise<void> {
        await this.saveDialog.waitForDisplayed({ timeout: 10000 });
        await this.sessionNameField.waitForDisplayed({ timeout: 5000 });
        await this.sessionNameField.clearValue();
        await this.sessionNameField.setValue(name);
        await this.saveButton.click();
    }

    async discardRecording(): Promise<void> {
        await this.discardButton.waitForDisplayed({ timeout: 10000 });
        await this.discardButton.click();
    }
}

export default new SessionsPage();

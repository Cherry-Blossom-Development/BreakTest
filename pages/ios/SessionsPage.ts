import BasePage from './BasePage';

/**
 * Page object for iOS Sessions feature.
 * Provides selectors and actions for testing Sessions screens.
 */
class SessionsPage extends BasePage {
    // -- Screen identifier --
    get screenSessions() { return this.aid('screenSessions'); }

    // -- Tab picker --
    get tabPicker() { return this.aid('sessionsTabPicker'); }

    // -- Recording controls --
    get recordButton() { return this.aid('sessionsRecordButton'); }
    get stopButton() { return this.aid('sessionsStopButton'); }
    get nowPlayingBar() { return this.aid('sessionsNowPlayingBar'); }
    get emptyState() { return this.aid('sessionsEmptyState'); }

    // -- Session rows --
    sessionRow(id: number) { return this.aid(`sessionsRow_${id}`); }
    playButton(id: number) { return this.aid(`sessionsPlayButton_${id}`); }
    deleteButton(id: number) { return this.aid(`sessionsDeleteButton_${id}`); }
    bandMemberPlayButton(id: number) { return this.aid(`sessionsBandMemberPlayButton_${id}`); }

    // -- Save recording form --
    get saveRecordingForm() { return this.aid('sessionsSaveRecordingForm'); }
    get sessionNameField() { return this.aid('sessionsSessionNameField'); }
    get sessionDateField() { return this.aid('sessionsSessionDateField'); }
    get sessionBandPicker() { return this.aid('sessionsSessionBandPicker'); }
    get sessionInstrumentPicker() { return this.aid('sessionsSessionInstrumentPicker'); }
    get saveRecordingButton() { return this.aid('sessionsSaveRecordingButton'); }
    get discardButton() { return this.aid('sessionsDiscardButton'); }

    // -- Bands tab --
    get newBandButton() { return this.aid('sessionsNewBandButton'); }
    get bandNameField() { return this.aid('sessionsBandNameField'); }
    get bandDescriptionField() { return this.aid('sessionsBandDescriptionField'); }
    get createBandButton() { return this.aid('sessionsCreateBandButton'); }

    // -- Band invites --
    get inviteHandleField() { return this.aid('sessionsInviteHandleField'); }
    get inviteSendButton() { return this.aid('sessionsInviteSendButton'); }

    /**
     * Wait for the Sessions screen to be displayed.
     */
    async waitForScreen(timeout = 30000): Promise<void> {
        await this.screenSessions.waitForDisplayed({ timeout });
    }

    /**
     * Select a tab (Band Practice, Individual, or Bands).
     * Uses the segmented picker.
     */
    async selectTab(tabName: 'Band Practice' | 'Individual' | 'Bands'): Promise<void> {
        // iOS segmented control tabs are accessed by their label text
        const tab = await $(`~${tabName}`);
        await tab.waitForDisplayed({ timeout: 10000 });
        await tab.click();
    }

    /**
     * Tap the record button to start recording.
     */
    async startRecording(): Promise<void> {
        await this.recordButton.waitForDisplayed({ timeout: 10000 });
        await this.recordButton.click();
    }

    /**
     * Tap the stop button to stop recording.
     */
    async stopRecording(): Promise<void> {
        await this.stopButton.waitForDisplayed({ timeout: 10000 });
        await this.stopButton.click();
    }

    /**
     * Save the current recording with the given name.
     */
    async saveRecording(name: string): Promise<void> {
        await this.saveRecordingForm.waitForDisplayed({ timeout: 10000 });
        await this.sessionNameField.waitForDisplayed({ timeout: 5000 });
        await this.sessionNameField.clearValue();
        await this.sessionNameField.setValue(name);
        await this.saveRecordingButton.click();
    }

    /**
     * Discard the current recording.
     */
    async discardRecording(): Promise<void> {
        await this.discardButton.waitForDisplayed({ timeout: 10000 });
        await this.discardButton.click();
    }

    /**
     * Play a session by its ID.
     */
    async playSession(id: number): Promise<void> {
        const btn = this.playButton(id);
        await btn.waitForDisplayed({ timeout: 10000 });
        await btn.click();
    }

    /**
     * Delete a session by its ID.
     */
    async deleteSession(id: number): Promise<void> {
        const btn = this.deleteButton(id);
        await btn.waitForDisplayed({ timeout: 10000 });
        await btn.click();
    }

    /**
     * Check if now playing bar is visible.
     */
    async isPlaying(): Promise<boolean> {
        try {
            await this.nowPlayingBar.waitForDisplayed({ timeout: 3000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check if empty state is displayed.
     */
    async isEmpty(): Promise<boolean> {
        try {
            await this.emptyState.waitForDisplayed({ timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Create a new band with the given name.
     */
    async createBand(name: string, description?: string): Promise<void> {
        await this.newBandButton.waitForDisplayed({ timeout: 10000 });
        await this.newBandButton.click();
        await this.bandNameField.waitForDisplayed({ timeout: 5000 });
        await this.bandNameField.setValue(name);
        if (description) {
            await this.bandDescriptionField.setValue(description);
        }
        await this.createBandButton.click();
    }

    /**
     * Invite a member to the current band.
     */
    async inviteMember(handle: string): Promise<void> {
        await this.inviteHandleField.waitForDisplayed({ timeout: 10000 });
        await this.inviteHandleField.setValue(handle);
        await this.inviteSendButton.click();
    }
}

export default new SessionsPage();

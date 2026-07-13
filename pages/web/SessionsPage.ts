import BasePage from './BasePage';

class SessionsPage extends BasePage {
    get container() {
        return $('.sessions-page');
    }

    get heading() {
        return $('.sessions-page h1');
    }

    get sectionTabs() {
        return $$('.section-tab');
    }

    get activeTab() {
        return $('.section-tab.active');
    }

    get uploadFileInput() {
        return $('input.file-input[type="file"]');
    }

    get uploadButton() {
        return $('button.upload-btn');
    }

    get sessionNameInput() {
        return $('input.text-input[placeholder="Recording name"]');
    }

    /** The Name/Recording-name field — works on both Band Practice ("Session name")
     *  and Individual ("Recording name") tabs, which share the same wrapper markup. */
    get nameInput() {
        return $('.autocomplete-container input.text-input');
    }

    // ─── New Recording: upload/record chooser ─────────────────────────────────

    get recordModeChooser() {
        return $('.record-mode-chooser');
    }

    get recordModeButtons() {
        return $$('.record-mode-btn');
    }

    get backButton() {
        return $('.record-mode-back');
    }

    get fileLabel() {
        return $('.file-label');
    }

    get renameChoiceKeepRadio() {
        return $('.rename-choice input[value="keep"]');
    }

    get renameChoiceRenameRadio() {
        return $('.rename-choice input[value="rename"]');
    }

    get recIndicator() {
        return $('.rec-indicator');
    }

    get levelMeter() {
        return $('.level-meter');
    }

    get recordMicButton() {
        return $('.rec-btn');
    }

    get stopRecordingButton() {
        return $('.rec-stop-btn');
    }

    get recordingPreviewAudio() {
        return $('.recording-preview audio');
    }

    get discardButton() {
        return $('.discard-btn');
    }

    get autocompleteDropdown() {
        return $('.autocomplete-dropdown');
    }

    get autocompleteItems() {
        return $$('.autocomplete-dropdown li');
    }

    get sessionRows() {
        return $$('.sessions-card tbody tr');
    }

    async open(): Promise<void> {
        await super.open('/sessions');
    }

    async clickTab(tabName: 'Band Practice' | 'Individual' | 'Bands'): Promise<void> {
        const tabs = await $$('.section-tab');
        for (const tab of tabs) {
            const text = await tab.getText();
            if (text.trim() === tabName) {
                await tab.click();
                await browser.pause(300);
                return;
            }
        }
        throw new Error(`Tab "${tabName}" not found`);
    }

    async getActiveTabText(): Promise<string> {
        return this.activeTab.getText();
    }

    async isUploadButtonDisabled(): Promise<boolean> {
        const disabled = await this.uploadButton.getAttribute('disabled');
        return disabled !== null;
    }

    /** Clicks "Upload a Recording" or "Record a Live Session" on the Step 1 chooser. */
    async chooseMode(mode: 'upload' | 'record'): Promise<void> {
        // Exact match matters here: "Upload a Recording" contains the substring "Record",
        // so a loose .includes('Record') check for the record mode also matches upload.
        const targetLabel = mode === 'upload' ? 'Upload a Recording' : 'Record a Live Session';
        const buttons = await this.recordModeButtons;
        for (const btn of buttons) {
            const label = await btn.$('.record-mode-label').getText();
            if (label.trim() === targetLabel) {
                await btn.click();
                return;
            }
        }
        throw new Error(`Record mode button for "${mode}" not found`);
    }

    /** Selects a local file on the hidden (display:none) file input. WebdriverIO's
     *  interactability check rejects display:none elements even though the underlying
     *  file-upload command works fine, so the input is unhidden just long enough to set it. */
    async chooseFile(filePath: string): Promise<void> {
        const input = await this.uploadFileInput;
        await browser.execute((el: HTMLElement) => { el.style.display = 'block'; }, input);
        await input.setValue(filePath);
        await browser.execute((el: HTMLElement) => { el.style.display = ''; }, input);
    }

    /** Finds a row in the Your Sessions table by its session name. The name lives in an
     *  inline-edit <input> (for renaming in place), so its value — not the row's
     *  rendered text — is what has to be checked. */
    async findSessionRow(name: string) {
        const rows = await this.sessionRows;
        for (const row of rows) {
            const nameInput = await row.$('input.inline-edit');
            if ((await nameInput.isExisting()) && (await nameInput.getValue()) === name) {
                return row;
            }
        }
        return null;
    }

    /** Deletes a session row and accepts the native confirm() dialog. */
    async deleteSessionRow(name: string): Promise<void> {
        const row = await this.findSessionRow(name);
        if (!row) throw new Error(`Session row "${name}" not found`);
        const deleteBtn = await row.$('.delete-btn');
        await deleteBtn.click();
        await browser.acceptAlert();
    }
}

export default new SessionsPage();

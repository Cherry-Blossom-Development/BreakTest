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
}

export default new SessionsPage();

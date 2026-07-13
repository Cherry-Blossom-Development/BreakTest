import LoginPage from '../../pages/web/LoginPage';
import SessionsPage from '../../pages/web/SessionsPage';
import TestUsers from '../data/testUsers';

describe('Breakroom Web - Sessions', () => {
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
    });

    // ─── Page structure ────────────────────────────────────────────────────────

    it('should display the Sessions page heading', async () => {
        await SessionsPage.heading.waitForDisplayed({ timeout: 5000 });
        expect(await SessionsPage.heading.getText()).toBe('Sessions');
    });

    it('should display three section tabs', async () => {
        const tabs = await SessionsPage.sectionTabs;
        expect(tabs.length).toBe(3);
    });

    it('should display Band Practice, Individual, and Bands tabs', async () => {
        const tabs = await SessionsPage.sectionTabs;
        const labels: string[] = [];
        for (const tab of tabs) {
            labels.push(await tab.getText());
        }
        expect(labels).toContain('Band Practice');
        expect(labels).toContain('Individual');
        expect(labels).toContain('Bands');
    });

    // ─── Tab switching ─────────────────────────────────────────────────────────

    it('should default to the Band Practice tab', async () => {
        expect(await SessionsPage.getActiveTabText()).toBe('Band Practice');
    });

    it('should switch to the Individual tab', async () => {
        await SessionsPage.clickTab('Individual');
        expect(await SessionsPage.getActiveTabText()).toBe('Individual');
    });

    it('should switch to the Bands tab', async () => {
        await SessionsPage.clickTab('Bands');
        expect(await SessionsPage.getActiveTabText()).toBe('Bands');
    });

    it('should switch back to Band Practice tab', async () => {
        await SessionsPage.clickTab('Individual');
        await SessionsPage.clickTab('Band Practice');
        expect(await SessionsPage.getActiveTabText()).toBe('Band Practice');
    });

    // ─── Individual tab content ────────────────────────────────────────────────
    // Individual (like Band Practice) now opens on a Step 1 upload/record chooser —
    // these elements only render after "Upload a Recording" is chosen. See
    // sessions-recording.spec.ts for full coverage of the chooser and live recording.

    it('should show a file input on the Individual tab after choosing Upload', async () => {
        await SessionsPage.clickTab('Individual');
        await SessionsPage.chooseMode('upload');
        await SessionsPage.uploadFileInput.waitForExist({ timeout: 5000 });
        expect(await SessionsPage.uploadFileInput.isExisting()).toBe(true);
    });

    it('should show an Upload button on the Individual tab after choosing Upload', async () => {
        await SessionsPage.clickTab('Individual');
        await SessionsPage.chooseMode('upload');
        await SessionsPage.uploadButton.waitForExist({ timeout: 5000 });
        expect(await SessionsPage.uploadButton.isDisplayed()).toBe(true);
    });

    it('should disable the Upload button when no file is selected', async () => {
        await SessionsPage.clickTab('Individual');
        await SessionsPage.chooseMode('upload');
        await SessionsPage.uploadButton.waitForExist({ timeout: 5000 });
        expect(await SessionsPage.isUploadButtonDisabled()).toBe(true);
    });

    it('should show a recording name input after switching to "Rename it"', async () => {
        await SessionsPage.clickTab('Individual');
        await SessionsPage.chooseMode('upload');
        await SessionsPage.renameChoiceRenameRadio.click();
        await SessionsPage.sessionNameInput.waitForExist({ timeout: 5000 });
        expect(await SessionsPage.sessionNameInput.isExisting()).toBe(true);
    });
});

import LoginPage from '../../pages/android/LoginPage';
import NavigationPage from '../../pages/android/NavigationPage';
import SessionsPage from '../../pages/android/SessionsPage';
import TestUsers from '../data/testUsers';

async function loginAndNavigateToSessions(): Promise<void> {
    await driver.terminateApp('com.cherryblossomdev.breakroom');
    await driver.pause(2000);
    await driver.execute('mobile: clearApp', { appId: 'com.cherryblossomdev.breakroom' });
    await driver.activateApp('com.cherryblossomdev.breakroom');
    await LoginPage.waitForScreen(90000);
    await LoginPage.login(TestUsers.standard.handle, TestUsers.standard.password);
    await driver.pause(3000);
    await NavigationPage.openDrawerAndTap('Sessions');
    await SessionsPage.waitForScreen(15000);
}

describe('Breakroom Android - Sessions', () => {
    before(async () => {
        await loginAndNavigateToSessions();
    });

    beforeEach(async () => {
        // Navigate back to sessions between tests if needed
        await SessionsPage.screen.waitForDisplayed({ timeout: 5000 });
    });

    // ─── Page structure ────────────────────────────────────────────────────────

    it('should display the Sessions screen', async () => {
        expect(await SessionsPage.screen.isDisplayed()).toBe(true);
    });

    it('should display the Band Practice tab', async () => {
        expect(await SessionsPage.isTabVisible('Band Practice')).toBe(true);
    });

    it('should display the Individual tab', async () => {
        expect(await SessionsPage.isTabVisible('Individual')).toBe(true);
    });

    it('should display the Bands tab', async () => {
        expect(await SessionsPage.isTabVisible('Bands')).toBe(true);
    });

    // ─── Tab switching ─────────────────────────────────────────────────────────

    it('should default to the Band Practice tab content', async () => {
        await SessionsPage.bpContent.waitForDisplayed({ timeout: 5000 });
        expect(await SessionsPage.bpContent.isDisplayed()).toBe(true);
    });

    it('should switch to the Individual tab', async () => {
        await SessionsPage.clickTab('Individual');
        await SessionsPage.indContent.waitForDisplayed({ timeout: 5000 });
        expect(await SessionsPage.indContent.isDisplayed()).toBe(true);
    });

    it('should switch to the Bands tab', async () => {
        await SessionsPage.clickTab('Bands');
        await SessionsPage.bandsContent.waitForDisplayed({ timeout: 5000 });
        expect(await SessionsPage.bandsContent.isDisplayed()).toBe(true);
    });

    it('should switch back to the Band Practice tab', async () => {
        await SessionsPage.clickTab('Bands');
        await SessionsPage.clickTab('Band Practice');
        await SessionsPage.bpContent.waitForDisplayed({ timeout: 5000 });
        expect(await SessionsPage.bpContent.isDisplayed()).toBe(true);
    });
});

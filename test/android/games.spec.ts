import LoginPage from '../../pages/android/LoginPage';
import NavigationPage from '../../pages/android/NavigationPage';
import GamesPage from '../../pages/android/GamesPage';
import HaulonautPlayPage from '../../pages/android/HaulonautPlayPage';
import TestUsers from '../data/testUsers';

// The seeded test universe (see BreakTest/database/seed-data.sql) has exactly two
// sectors, 1 and 2, linked to each other, both carrying the same "Test Outpost"
// feature. A fresh character spawns at a random one of the two, so tests read the
// starting sector rather than assuming it, and warp to "the other" sector.
const testCaptainName = `Test Captain ${Date.now()}`;

async function loginAndNavigateToGames(): Promise<void> {
    await driver.execute('mobile: clearApp', { appId: 'com.cherryblossomdev.breakroom' });
    await driver.activateApp('com.cherryblossomdev.breakroom');
    await LoginPage.waitForScreen(90000);
    await LoginPage.login(TestUsers.standard.handle, TestUsers.standard.password);
    await driver.pause(3000);
    await NavigationPage.openDrawerAndTap('Games');
    await GamesPage.waitForScreen(15000);
}

describe('Breakroom Android - Games / Haulonaut', () => {
    before(async () => {
        await loginAndNavigateToGames();
    });

    it('should display the Games screen with the Haulonaut ad card', async () => {
        expect(await GamesPage.screen.isDisplayed()).toBe(true);
        await GamesPage.playNowBtn.waitForDisplayed({ timeout: 5000 });
        expect(await GamesPage.playNowBtn.isDisplayed()).toBe(true);
    });

    it('should display the New Character button for the active universe', async () => {
        await GamesPage.newCharacterBtn.waitForDisplayed({ timeout: 5000 });
        expect(await GamesPage.newCharacterBtn.isDisplayed()).toBe(true);
    });

    // ─── Character creation → play screen (sequentially dependent) ────────────

    it('should create a character and land on the fullscreen play screen', async () => {
        await GamesPage.createCharacter(testCaptainName);
        await HaulonautPlayPage.waitForScreen(15000);
        expect(await HaulonautPlayPage.screen.isDisplayed()).toBe(true);
    });

    it('should start with 1000 Credits and 100 Rations', async () => {
        await HaulonautPlayPage.creditsText.waitForDisplayed({ timeout: 5000 });
        const credits = await HaulonautPlayPage.readResourceValue(await HaulonautPlayPage.creditsText);
        const rations = await HaulonautPlayPage.readResourceValue(await HaulonautPlayPage.rationsText);
        expect(credits).toBe(1000);
        expect(rations).toBe(100);
    });

    it('should show the Visit Outpost action (seeded on every sector)', async () => {
        await HaulonautPlayPage.visitOutpostBtn.waitForDisplayed({ timeout: 5000 });
        expect(await HaulonautPlayPage.visitOutpostBtn.isDisplayed()).toBe(true);
    });

    // ─── Outpost purchase flow ──────────────────────────────────────────────────

    it('should deduct Credits and add to Rations when buying Rations at the outpost', async () => {
        const creditsBefore = await HaulonautPlayPage.readResourceValue(await HaulonautPlayPage.creditsText);
        const rationsBefore = await HaulonautPlayPage.readResourceValue(await HaulonautPlayPage.rationsText);

        await HaulonautPlayPage.visitOutpostBtn.click();
        const buyRationsBtn = HaulonautPlayPage.buyBtn('rations');
        await buyRationsBtn.waitForDisplayed({ timeout: 5000 });
        await buyRationsBtn.click();

        // Purchases resolve async then update the HUD -- wait for the credits
        // pill to actually change rather than a fixed sleep.
        await browser.waitUntil(
            async () => (await HaulonautPlayPage.readResourceValue(await HaulonautPlayPage.creditsText)) === creditsBefore - 4,
            { timeout: 8000, timeoutMsg: 'Credits did not decrease by 4 after buying Rations' }
        );
        const rationsAfter = await HaulonautPlayPage.readResourceValue(await HaulonautPlayPage.rationsText);
        expect(rationsAfter).toBe(rationsBefore + 1);
    });

    it('should add a non-Rations purchase to Cargo instead of the Rations stat', async () => {
        const creditsBefore = await HaulonautPlayPage.readResourceValue(await HaulonautPlayPage.creditsText);

        const buyFuelBtn = HaulonautPlayPage.buyBtn('fuel');
        await buyFuelBtn.waitForDisplayed({ timeout: 5000 });
        await buyFuelBtn.click();
        await browser.waitUntil(
            async () => (await HaulonautPlayPage.readResourceValue(await HaulonautPlayPage.creditsText)) === creditsBefore - 6,
            { timeout: 8000, timeoutMsg: 'Credits did not decrease by 6 after buying Fuel Cell' }
        );

        await HaulonautPlayPage.backToSectorBtn.waitForDisplayed({ timeout: 5000 });
        await HaulonautPlayPage.backToSectorBtn.click();
        await HaulonautPlayPage.viewCargoBtn.waitForDisplayed({ timeout: 5000 });
        await HaulonautPlayPage.viewCargoBtn.click();

        const fuelCellRow = await $('android=new UiSelector().textContains("Fuel Cell")');
        await fuelCellRow.waitForDisplayed({ timeout: 5000 });
        expect(await fuelCellRow.isDisplayed()).toBe(true);

        await HaulonautPlayPage.backToSectorBtn.waitForDisplayed({ timeout: 5000 });
        await HaulonautPlayPage.backToSectorBtn.click();
    });

    // ─── Warp navigation ────────────────────────────────────────────────────────

    it('should warp to the other sector and deduct 1 Ration', async () => {
        const startSector = await HaulonautPlayPage.getSectorNumber();
        const targetSector = startSector === 1 ? 2 : 1;
        const rationsBefore = await HaulonautPlayPage.readResourceValue(await HaulonautPlayPage.rationsText);

        await HaulonautPlayPage.warpBtn(targetSector).waitForDisplayed({ timeout: 5000 });
        await HaulonautPlayPage.warpBtn(targetSector).click();

        await browser.waitUntil(
            async () => (await HaulonautPlayPage.getSectorNumber()) === targetSector,
            { timeout: 8000, timeoutMsg: `Did not arrive in Sector ${targetSector}` }
        );
        const rationsAfter = await HaulonautPlayPage.readResourceValue(await HaulonautPlayPage.rationsText);
        expect(rationsAfter).toBe(rationsBefore - 1);
    });

    // ─── Back to Games ──────────────────────────────────────────────────────────

    it('should return to the Games screen and list the character under Your Current Games', async () => {
        await driver.back();
        await GamesPage.waitForScreen(15000);
        const captainRow = await $(`android=new UiSelector().textContains("${testCaptainName}")`);
        await captainRow.waitForDisplayed({ timeout: 5000 });
        expect(await captainRow.isDisplayed()).toBe(true);
        await GamesPage.characterResumeBtn.waitForDisplayed({ timeout: 5000 });
        expect(await GamesPage.characterResumeBtn.isDisplayed()).toBe(true);
    });
});

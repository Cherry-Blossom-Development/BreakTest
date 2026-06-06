import LoginPage from '../../pages/android/LoginPage';
import NavigationPage from '../../pages/android/NavigationPage';
import CollectionsPage from '../../pages/android/CollectionsPage';
import TestUsers from '../data/testUsers';

const testCollectionName = `Test Collection ${Date.now()}`;
const editedCollectionName = `${testCollectionName} Edited`;

async function loginAndNavigateToCollections(): Promise<void> {
    await driver.terminateApp('com.cherryblossomdev.breakroom');
    await driver.pause(2000);
    await driver.execute('mobile: clearApp', { appId: 'com.cherryblossomdev.breakroom' });
    await driver.activateApp('com.cherryblossomdev.breakroom');
    await LoginPage.waitForScreen(90000);
    await LoginPage.login(TestUsers.standard.handle, TestUsers.standard.password);
    await driver.pause(3000);
    await NavigationPage.openDrawerAndTap('Artist Showcase');
    await CollectionsPage.waitForScreen(15000);
}

describe('Breakroom Android - Collections', () => {
    before(async () => {
        await loginAndNavigateToCollections();
    });

    beforeEach(async () => {
        await CollectionsPage.screen.waitForDisplayed({ timeout: 10000 });
    });

    // ─── Page structure ────────────────────────────────────────────────────────

    it('should display the Collections screen', async () => {
        expect(await CollectionsPage.screen.isDisplayed()).toBe(true);
    });

    it('should display the New Collection FAB', async () => {
        await CollectionsPage.fab.waitForDisplayed({ timeout: 5000 });
        expect(await CollectionsPage.fab.isDisplayed()).toBe(true);
    });

    it('should display the Orders button', async () => {
        await CollectionsPage.ordersBtn.waitForDisplayed({ timeout: 5000 });
        expect(await CollectionsPage.ordersBtn.isDisplayed()).toBe(true);
    });

    it('should display the Shipping button', async () => {
        await CollectionsPage.shippingBtn.waitForDisplayed({ timeout: 5000 });
        expect(await CollectionsPage.shippingBtn.isDisplayed()).toBe(true);
    });

    // ─── New Collection dialog ─────────────────────────────────────────────────

    it('should open the New Collection dialog when FAB is tapped', async () => {
        await CollectionsPage.fab.waitForDisplayed({ timeout: 5000 });
        await CollectionsPage.fab.click();
        await CollectionsPage.nameInput.waitForDisplayed({ timeout: 5000 });
        expect(await CollectionsPage.nameInput.isDisplayed()).toBe(true);
        await CollectionsPage.dialogCancelBtn.click();
        await CollectionsPage.nameInput.waitForDisplayed({ timeout: 5000, reverse: true });
    });

    it('should close the dialog when Cancel is tapped', async () => {
        await CollectionsPage.fab.click();
        await CollectionsPage.nameInput.waitForDisplayed({ timeout: 5000 });
        await CollectionsPage.dialogCancelBtn.click();
        await CollectionsPage.nameInput.waitForDisplayed({ timeout: 5000, reverse: true });
        expect(await CollectionsPage.nameInput.isExisting()).toBe(false);
    });

    // ─── CRUD flow (sequentially dependent) ───────────────────────────────────

    it('should create a new collection and show it in the grid', async () => {
        await CollectionsPage.createCollection(testCollectionName);
        await browser.waitUntil(
            async () => (await CollectionsPage.findCardWithName(testCollectionName)) !== null,
            { timeout: 8000, timeoutMsg: `Collection "${testCollectionName}" did not appear in grid` }
        );
        const card = await CollectionsPage.findCardWithName(testCollectionName);
        expect(card).not.toBeNull();
    });

    it('should open the Edit dialog with the collection name prefilled', async () => {
        const card = await CollectionsPage.findCardWithName(testCollectionName);
        expect(card).not.toBeNull();
        const editBtn = await CollectionsPage.getEditBtnForCard(card!);
        await editBtn.waitForDisplayed({ timeout: 5000 });
        await editBtn.click();
        await CollectionsPage.nameInput.waitForDisplayed({ timeout: 5000 });
        const value = await CollectionsPage.nameInput.getText();
        expect(value).toContain(testCollectionName);
        // Dialog has "Cancel" and "Save" buttons; dismiss without saving
        await CollectionsPage.dialogCancelBtn.waitForDisplayed({ timeout: 3000 });
        await CollectionsPage.dialogCancelBtn.click();
        await CollectionsPage.nameInput.waitForDisplayed({ timeout: 5000, reverse: true });
    });

    it('should update the collection name after editing', async () => {
        const card = await CollectionsPage.findCardWithName(testCollectionName);
        const editBtn = await CollectionsPage.getEditBtnForCard(card!);
        await editBtn.click();
        await CollectionsPage.nameInput.waitForDisplayed({ timeout: 5000 });
        await CollectionsPage.nameInput.clearValue();
        await CollectionsPage.nameInput.setValue(editedCollectionName);
        await driver.hideKeyboard();
        await CollectionsPage.dialogSaveBtnEdit.waitForEnabled({ timeout: 3000 });
        await CollectionsPage.dialogSaveBtnEdit.click();
        await CollectionsPage.nameInput.waitForDisplayed({ timeout: 5000, reverse: true });
        await browser.waitUntil(
            async () => (await CollectionsPage.findCardWithName(editedCollectionName)) !== null,
            { timeout: 8000, timeoutMsg: `Renamed collection "${editedCollectionName}" not found` }
        );
    });

    it('should open a delete confirmation dialog', async () => {
        const card = await CollectionsPage.findCardWithName(editedCollectionName);
        expect(card).not.toBeNull();
        const deleteBtn = await CollectionsPage.getDeleteBtnForCard(card!);
        await deleteBtn.waitForDisplayed({ timeout: 5000 });
        await deleteBtn.click();
        await CollectionsPage.deleteConfirmBtn.waitForDisplayed({ timeout: 5000 });
        expect(await CollectionsPage.deleteConfirmBtn.isDisplayed()).toBe(true);
        await CollectionsPage.deleteCancelBtn.click();
        await CollectionsPage.deleteConfirmBtn.waitForDisplayed({ timeout: 5000, reverse: true });
    });

    it('should keep the collection when delete is cancelled', async () => {
        const card = await CollectionsPage.findCardWithName(editedCollectionName);
        const deleteBtn = await CollectionsPage.getDeleteBtnForCard(card!);
        await deleteBtn.click();
        await CollectionsPage.deleteConfirmBtn.waitForDisplayed({ timeout: 5000 });
        await CollectionsPage.deleteCancelBtn.click();
        await CollectionsPage.deleteConfirmBtn.waitForDisplayed({ timeout: 5000, reverse: true });
        const still = await CollectionsPage.findCardWithName(editedCollectionName);
        expect(still).not.toBeNull();
    });

    it('should remove the collection from the grid after deleting', async () => {
        const card = await CollectionsPage.findCardWithName(editedCollectionName);
        const deleteBtn = await CollectionsPage.getDeleteBtnForCard(card!);
        await deleteBtn.click();
        await CollectionsPage.deleteConfirmBtn.waitForDisplayed({ timeout: 5000 });
        await CollectionsPage.deleteConfirmBtn.click();
        await CollectionsPage.deleteConfirmBtn.waitForDisplayed({ timeout: 5000, reverse: true });
        await browser.waitUntil(
            async () => (await CollectionsPage.findCardWithName(editedCollectionName)) === null,
            { timeout: 8000, timeoutMsg: `Collection "${editedCollectionName}" still visible after deletion` }
        );
    });
});

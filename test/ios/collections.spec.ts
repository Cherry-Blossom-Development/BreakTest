import LoginPage from '../../pages/ios/LoginPage';
import NavigationPage from '../../pages/ios/NavigationPage';
import CollectionsPage from '../../pages/ios/CollectionsPage';
import EulaPage from '../../pages/ios/EulaPage';
import TestUsers from '../data/testUsers';

const BUNDLE_ID = 'com.cherryblossomdev.Breakroom';
const TEST_API_URL = process.env.TEST_API_URL || 'https://dev.prosaurus.com';

async function freshLogin(handle: string, password: string): Promise<void> {
    try {
        await driver.terminateApp(BUNDLE_ID);
    } catch {
        // App might not be running
    }
    await driver.execute('mobile: launchApp', {
        bundleId: BUNDLE_ID,
        arguments: ['-CLEAR_AUTH_STATE', 'YES', '-TEST_API_URL', TEST_API_URL],
    });
    await LoginPage.waitForScreen(90000);
    await LoginPage.login(handle, password);
    await driver.pause(5000);

    // Accept EULA if it appears after login
    await EulaPage.acceptIfDisplayed();
}

async function navigateToCollections(): Promise<void> {
    // Navigate to Tool Shed tab
    await NavigationPage.tabToolShed.waitForDisplayed({ timeout: 10000 });
    await NavigationPage.tabToolShed.click();
    await NavigationPage.screenToolShed.waitForDisplayed({ timeout: 10000 });
    await driver.pause(2000); // Wait for features to load

    // Find and tap Collections "Open" button in Tool Shed
    // The button identifier is: {toolName}OpenButton (lowercased, no spaces)
    // Collections is in the Artist category, may need scrolling
    const collectionsOpenButton = await $('~collectionsOpenButton');

    // Try to scroll to find the button if not immediately visible
    for (let attempt = 0; attempt < 5; attempt++) {
        try {
            const isDisplayed = await collectionsOpenButton.isDisplayed();
            if (isDisplayed) break;
        } catch {
            // Element not found yet
        }
        // Scroll down to find it
        await driver.execute('mobile: scroll', { direction: 'down' });
        await driver.pause(500);
    }

    await collectionsOpenButton.waitForDisplayed({ timeout: 10000 });
    await collectionsOpenButton.click();
}

// -----------------------------------------------------------------------------
// 1. Collections - Navigation
// -----------------------------------------------------------------------------
describe('Breakroom iOS - Collections - Navigation', () => {
    before(async () => {
        await freshLogin(TestUsers.standard.handle, TestUsers.standard.password);
    });

    it('should navigate to Collections from Tool Shed', async () => {
        await navigateToCollections();
        await CollectionsPage.waitForScreen();
        expect(await CollectionsPage.screenCollections.isDisplayed()).toBe(true);
    });

    it('should display either collections list or empty state', async () => {
        const hasList = await CollectionsPage.hasCollections();
        const isEmpty = await CollectionsPage.isEmpty();
        expect(hasList || isEmpty).toBe(true);
    });

    it('should go back to Tool Shed', async () => {
        await driver.back();
        await driver.pause(500);
        await NavigationPage.screenToolShed.waitForDisplayed({ timeout: 10000 });
        expect(await NavigationPage.screenToolShed.isDisplayed()).toBe(true);
    });
});

// -----------------------------------------------------------------------------
// 2. Collections - Create Collection
// -----------------------------------------------------------------------------
describe('Breakroom iOS - Collections - Create Collection', () => {
    const testCollectionName = `Test Collection ${Date.now()}`;

    before(async () => {
        await freshLogin(TestUsers.standard.handle, TestUsers.standard.password);
        await navigateToCollections();
        await CollectionsPage.waitForScreen();
    });

    it('should show the add collection button', async () => {
        // Either the add button (in toolbar) or create first button (empty state) should be visible
        try {
            await CollectionsPage.addButton.waitForDisplayed({ timeout: 5000 });
            expect(await CollectionsPage.addButton.isDisplayed()).toBe(true);
        } catch {
            await CollectionsPage.createFirstButton.waitForDisplayed({ timeout: 5000 });
            expect(await CollectionsPage.createFirstButton.isDisplayed()).toBe(true);
        }
    });

    it('should open the create collection form', async () => {
        try {
            if (await CollectionsPage.addButton.isDisplayed()) {
                await CollectionsPage.addButton.click();
            } else {
                await CollectionsPage.createFirstButton.click();
            }
        } catch {
            await CollectionsPage.createFirstButton.click();
        }
        await CollectionsPage.collectionForm.waitForDisplayed({ timeout: 5000 });
        expect(await CollectionsPage.collectionForm.isDisplayed()).toBe(true);
    });

    it('should have the name field', async () => {
        await CollectionsPage.nameField.waitForDisplayed({ timeout: 5000 });
        expect(await CollectionsPage.nameField.isDisplayed()).toBe(true);
    });

    it('should have the save button disabled when name is empty', async () => {
        await CollectionsPage.nameField.clearValue();
        const saveButton = await CollectionsPage.saveButton;
        const isEnabled = await saveButton.isEnabled();
        expect(isEnabled).toBe(false);
    });

    it('should enable the save button when name is entered', async () => {
        await CollectionsPage.nameField.setValue(testCollectionName);
        await driver.pause(500);
        const saveButton = await CollectionsPage.saveButton;
        const isEnabled = await saveButton.isEnabled();
        expect(isEnabled).toBe(true);
    });

    it('should create the collection', async () => {
        await CollectionsPage.saveButton.click();
        await driver.pause(2000);
        // Should return to collections list
        await CollectionsPage.waitForScreen();
        expect(await CollectionsPage.screenCollections.isDisplayed()).toBe(true);
    });

    it('should cancel form without creating', async () => {
        await CollectionsPage.addButton.click();
        await CollectionsPage.collectionForm.waitForDisplayed({ timeout: 5000 });
        await CollectionsPage.cancelButton.click();
        await driver.pause(500);
        await CollectionsPage.waitForScreen();
        expect(await CollectionsPage.screenCollections.isDisplayed()).toBe(true);
    });
});

// -----------------------------------------------------------------------------
// 3. Collections - Collection Detail
// -----------------------------------------------------------------------------
describe('Breakroom iOS - Collections - Collection Detail', () => {
    before(async () => {
        await freshLogin(TestUsers.standard.handle, TestUsers.standard.password);
        await navigateToCollections();
        await CollectionsPage.waitForScreen();
    });

    it('should open a collection to view details', async () => {
        // First check if there are any collections
        const hasList = await CollectionsPage.hasCollections();
        if (!hasList) {
            // Create one first
            await CollectionsPage.createFirstCollection(`Detail Test ${Date.now()}`);
            await driver.pause(2000);
            await CollectionsPage.waitForScreen();
        }

        // Now tap on the first collection card
        // We need to find any collection card since we don't know the ID
        const collectionCards = await $$('~collectionCard_*');
        if (collectionCards.length > 0) {
            await collectionCards[0].click();
        } else {
            // Try scrolling to find a card
            const list = await CollectionsPage.collectionsList;
            await list.click();
        }
        await driver.pause(1000);
    });

    it('should display collection detail screen', async () => {
        await CollectionsPage.waitForDetailScreen();
        expect(await CollectionsPage.screenCollectionDetail.isDisplayed()).toBe(true);
    });

    it('should show add item button', async () => {
        await CollectionsPage.addItemButton.waitForDisplayed({ timeout: 10000 });
        expect(await CollectionsPage.addItemButton.isDisplayed()).toBe(true);
    });

    it('should go back to collections list', async () => {
        await driver.back();
        await driver.pause(500);
        await CollectionsPage.waitForScreen();
        expect(await CollectionsPage.screenCollections.isDisplayed()).toBe(true);
    });
});

// -----------------------------------------------------------------------------
// 4. Collections - Error States
// -----------------------------------------------------------------------------
describe('Breakroom iOS - Collections - UI States', () => {
    before(async () => {
        await freshLogin(TestUsers.standard.handle, TestUsers.standard.password);
        await navigateToCollections();
        await CollectionsPage.waitForScreen();
    });

    it('should not show loading indicator after data loads', async () => {
        // Wait for either list or empty state to appear
        await driver.pause(3000);
        const isLoading = await CollectionsPage.collectionsLoading.isDisplayed().catch(() => false);
        expect(isLoading).toBe(false);
    });

    it('should display appropriate content state', async () => {
        const hasList = await CollectionsPage.hasCollections();
        const isEmpty = await CollectionsPage.isEmpty();
        // One of these must be true
        expect(hasList || isEmpty).toBe(true);
    });
});

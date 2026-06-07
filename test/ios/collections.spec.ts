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

    // Find and tap Artist Showcase "Open" button in Tool Shed
    // The button identifier is: {toolName}OpenButton (lowercased, no spaces)
    // Artist Showcase is in the Artist category, which is after Musician category
    // Need more scrolling to find it
    const collectionsOpenButton = await $('~artistshowcaseOpenButton');

    // Scroll more aggressively to find the button in the Artist category
    for (let attempt = 0; attempt < 10; attempt++) {
        try {
            const isDisplayed = await collectionsOpenButton.isDisplayed();
            if (isDisplayed) break;
        } catch {
            // Element not found yet
        }
        // Scroll down to find it
        await driver.execute('mobile: scroll', { direction: 'down' });
        await driver.pause(1000);
    }

    await collectionsOpenButton.waitForDisplayed({ timeout: 15000 });
    await collectionsOpenButton.click();

    // Wait for navigation and loading to complete
    await driver.pause(2000);
}

// -----------------------------------------------------------------------------
// 1. Collections - Navigation
// -----------------------------------------------------------------------------
// SKIPPED: Artist Showcase feature not available in dev environment
describe.skip('Breakroom iOS - Collections - Navigation', () => {
    before(async () => {
        // Use admin user who has access to all Tool Shed features
        await freshLogin(TestUsers.admin.handle, TestUsers.admin.password);
    });

    it('should navigate to Collections from Tool Shed', async () => {
        await navigateToCollections();
        await CollectionsPage.waitForScreen();
        // If waitForScreen completes, we're on the Collections screen
        // Check for any Collections-specific element
        const hasScreen = await CollectionsPage.screenCollections.isDisplayed().catch(() => false);
        const hasList = await CollectionsPage.hasCollections();
        const isEmpty = await CollectionsPage.isEmpty();
        const hasAddButton = await CollectionsPage.addButton.isDisplayed().catch(() => false);
        expect(hasScreen || hasList || isEmpty || hasAddButton).toBe(true);
    });

    it('should display either collections list or empty state', async () => {
        // Wait a moment for any loading to complete
        await driver.pause(1000);
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
// SKIPPED: Artist Showcase feature not available in dev environment
describe.skip('Breakroom iOS - Collections - Create Collection', () => {
    const testCollectionName = `Test Collection ${Date.now()}`;

    before(async () => {
        // Use admin user who has access to all Tool Shed features
        await freshLogin(TestUsers.admin.handle, TestUsers.admin.password);
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
        await driver.pause(3000);
        // Should return to collections list - check for any collections screen indicator
        await CollectionsPage.waitForScreen();
        const onCollectionsScreen =
            await CollectionsPage.screenCollections.isDisplayed().catch(() => false) ||
            await CollectionsPage.hasCollections() ||
            await CollectionsPage.addButton.isDisplayed().catch(() => false);
        expect(onCollectionsScreen).toBe(true);
    });

    it('should cancel form without creating', async () => {
        // Check if add button is available (might not be if there are no collections)
        const addBtnVisible = await CollectionsPage.addButton.isDisplayed().catch(() => false);
        if (!addBtnVisible) {
            // On empty state, use create first button instead
            await CollectionsPage.createFirstButton.waitForDisplayed({ timeout: 5000 });
            await CollectionsPage.createFirstButton.click();
        } else {
            await CollectionsPage.addButton.click();
        }
        await CollectionsPage.collectionForm.waitForDisplayed({ timeout: 5000 });
        await CollectionsPage.cancelButton.click();
        await driver.pause(1000);
        await CollectionsPage.waitForScreen();
        const onCollectionsScreen =
            await CollectionsPage.screenCollections.isDisplayed().catch(() => false) ||
            await CollectionsPage.hasCollections() ||
            await CollectionsPage.isEmpty() ||
            await CollectionsPage.addButton.isDisplayed().catch(() => false);
        expect(onCollectionsScreen).toBe(true);
    });
});

// -----------------------------------------------------------------------------
// 3. Collections - Collection Detail
// -----------------------------------------------------------------------------
// SKIPPED: Artist Showcase feature not available in dev environment
describe.skip('Breakroom iOS - Collections - Collection Detail', () => {
    before(async () => {
        // Use admin user who has access to all Tool Shed features
        await freshLogin(TestUsers.admin.handle, TestUsers.admin.password);
        await navigateToCollections();
        await CollectionsPage.waitForScreen();
    });

    it('should open a collection to view details', async () => {
        // Wait for screen to settle
        await driver.pause(2000);

        // First check if there are any collections
        const hasList = await CollectionsPage.hasCollections();
        const isEmpty = await CollectionsPage.isEmpty();

        if (isEmpty) {
            // Create one first using the empty state button
            await CollectionsPage.createFirstButton.waitForDisplayed({ timeout: 5000 });
            await CollectionsPage.createFirstButton.click();
            await CollectionsPage.collectionForm.waitForDisplayed({ timeout: 5000 });
            await CollectionsPage.nameField.setValue(`Detail Test ${Date.now()}`);
            await CollectionsPage.saveButton.click();
            await driver.pause(3000);
            await CollectionsPage.waitForScreen();
        }

        // Now try to find and tap on a collection card
        // First scroll down to ensure we see the collections section
        await driver.execute('mobile: scroll', { direction: 'down' });
        await driver.pause(500);

        // Look for any element that starts with collectionCard_
        // Using xpath to find partial match on accessibility identifier
        const collectionCard = await $('-ios predicate string:name BEGINSWITH "collectionCard_"');
        try {
            await collectionCard.waitForDisplayed({ timeout: 10000 });
            await collectionCard.click();
            await driver.pause(1000);
        } catch {
            // If no card found, try tapping on the list itself
            const list = await CollectionsPage.collectionsList;
            if (await list.isDisplayed().catch(() => false)) {
                await list.click();
            }
        }
    });

    it('should display collection detail screen', async () => {
        // If we successfully navigated to a collection, we should see the detail screen
        // Give it time to load
        await driver.pause(2000);
        const detailVisible = await CollectionsPage.screenCollectionDetail.isDisplayed().catch(() => false);
        const addItemVisible = await CollectionsPage.addItemButton.isDisplayed().catch(() => false);
        // Either the detail screen ID is visible, or the add item button (which is on detail screen)
        expect(detailVisible || addItemVisible).toBe(true);
    });

    it('should show add item button', async () => {
        // The add item button might be on the detail screen or the add first item button
        const addItemVisible = await CollectionsPage.addItemButton.isDisplayed().catch(() => false);
        const addFirstItemVisible = await CollectionsPage.addFirstItemButton.isDisplayed().catch(() => false);
        expect(addItemVisible || addFirstItemVisible).toBe(true);
    });

    it('should go back to collections list', async () => {
        await driver.back();
        await driver.pause(1000);
        await CollectionsPage.waitForScreen();
        const onCollectionsScreen =
            await CollectionsPage.screenCollections.isDisplayed().catch(() => false) ||
            await CollectionsPage.hasCollections() ||
            await CollectionsPage.isEmpty() ||
            await CollectionsPage.addButton.isDisplayed().catch(() => false);
        expect(onCollectionsScreen).toBe(true);
    });
});

// -----------------------------------------------------------------------------
// 4. Collections - Error States
// -----------------------------------------------------------------------------
// SKIPPED: Artist Showcase feature not available in dev environment
describe.skip('Breakroom iOS - Collections - UI States', () => {
    before(async () => {
        // Use admin user who has access to all Tool Shed features
        await freshLogin(TestUsers.admin.handle, TestUsers.admin.password);
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
        // Wait for loading to complete
        await driver.pause(2000);
        const hasList = await CollectionsPage.hasCollections();
        const isEmpty = await CollectionsPage.isEmpty();
        const hasAddButton = await CollectionsPage.addButton.isDisplayed().catch(() => false);
        // One of these must be true - either collections list, empty state, or add button
        expect(hasList || isEmpty || hasAddButton).toBe(true);
    });
});
